import { streamers, streamTypes } from "../config";
import { defaultQuery } from "../store/querySlice";

/**
 * @typedef {import('../store/types').QueryFields} QueryFields
 */

/** Every query field, in a stable order. */
export const allQueryFields = Object.freeze([
    "searchText",
    "streamer",
    "streamType",
    "fromDate",
    "toDate",
    "streamTitle",
    "matchWholeWord",
]);

/** Query field -> short, human readable URL parameter name. */
const paramNames = Object.freeze({
    searchText: "q",
    streamer: "streamer",
    streamType: "type",
    fromDate: "from",
    toDate: "to",
    streamTitle: "title",
    matchWholeWord: "whole",
});

const knownParams = new Set(Object.values(paramNames));
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True for a real "YYYY-MM-DD" date (shape and value), so "2025-13-45" is rejected.
 * @param {string} value
 */
function isValidDate(value) {
    return dateRegex.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * Pick the query fields out of the store state (or any object holding them).
 * @param {Partial<QueryFields>} state
 * @returns {QueryFields}
 */
export function selectQuery(state) {
    return {
        searchText: state.searchText ?? defaultQuery.searchText,
        streamer: state.streamer ?? defaultQuery.streamer,
        streamType: state.streamType ?? [],
        fromDate: state.fromDate ?? defaultQuery.fromDate,
        toDate: state.toDate ?? defaultQuery.toDate,
        streamTitle: state.streamTitle ?? defaultQuery.streamTitle,
        matchWholeWord: state.matchWholeWord ?? defaultQuery.matchWholeWord,
    };
}

/**
 * Keep only the given fields of a query, resetting every other field to its default.
 * @param {QueryFields} query
 * @param {readonly string[]} fields
 * @returns {QueryFields}
 */
export function pickQueryFields(query, fields) {
    const picked = { ...defaultQuery, streamType: [] };
    for (const field of fields) {
        if (field in query) {
            picked[field] = query[field];
        }
    }
    return picked;
}

/**
 * True when the query has no filters or text set.
 * @param {QueryFields} query
 */
export function isQueryEmpty(query) {
    return (
        !query.searchText &&
        !query.streamer &&
        (!query.streamType || query.streamType.length === 0) &&
        !query.fromDate &&
        !query.toDate &&
        !query.streamTitle &&
        !query.matchWholeWord
    );
}

/**
 * Serialize a query into URL search parameters. Default values are omitted so the URL stays short.
 * Example: `?q=hello&streamer=Dokibird&type=Stream&type=Video&from=2025-01-01&whole=1`
 * @param {QueryFields} query
 * @returns {URLSearchParams}
 */
export function queryToSearchParams(query) {
    const params = new URLSearchParams();
    if (query.searchText) params.set(paramNames.searchText, query.searchText);
    if (query.streamer) params.set(paramNames.streamer, query.streamer);
    for (const type of query.streamType || []) {
        params.append(paramNames.streamType, type);
    }
    if (query.fromDate) params.set(paramNames.fromDate, query.fromDate);
    if (query.toDate) params.set(paramNames.toDate, query.toDate);
    if (query.streamTitle) params.set(paramNames.streamTitle, query.streamTitle);
    if (query.matchWholeWord) params.set(paramNames.matchWholeWord, "1");
    return params;
}

/**
 * True when the URL search parameters contain at least one query field.
 * @param {URLSearchParams} params
 */
export function hasQueryParams(params) {
    for (const key of params.keys()) {
        if (knownParams.has(key)) {
            return true;
        }
    }
    return false;
}

/**
 * Parse URL search parameters back into a full query. Missing, unknown or invalid values fall back to
 * their defaults so that a hand-edited URL can never put the form into a broken state.
 * @param {URLSearchParams} params
 * @returns {QueryFields}
 */
export function searchParamsToQuery(params) {
    const query = { ...defaultQuery, streamType: [] };

    const searchText = params.get(paramNames.searchText);
    if (searchText) query.searchText = searchText;

    const streamer = params.get(paramNames.streamer);
    if (streamer && streamers.includes(streamer)) query.streamer = streamer;

    const types = params
        .getAll(paramNames.streamType)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter((value) => streamTypes.includes(value));
    query.streamType = [...new Set(types)];

    const fromDate = params.get(paramNames.fromDate);
    if (fromDate && isValidDate(fromDate)) query.fromDate = fromDate;

    const toDate = params.get(paramNames.toDate);
    if (toDate && isValidDate(toDate)) query.toDate = toDate;

    const streamTitle = params.get(paramNames.streamTitle);
    if (streamTitle) query.streamTitle = streamTitle;

    const whole = (params.get(paramNames.matchWholeWord) || "").toLowerCase();
    query.matchWholeWord = whole === "1" || whole === "true" || whole === "yes";

    return query;
}
