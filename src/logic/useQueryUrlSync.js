import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/store";
import {
    allQueryFields,
    hasQueryParams,
    isQueryEmpty,
    pickQueryFields,
    queryToSearchParams,
    searchParamsToQuery,
    selectQuery,
} from "./queryParams";

/**
 * @typedef {import('../store/types').QueryFields} QueryFields
 */

/**
 * Keeps the query form (zustand store) in sync with the URL so a search or graph can be bookmarked and shared.
 *
 * - When the page is opened with query parameters (`/search?q=hello&streamer=Dokibird`), the store is
 *   filled from the URL and `onHydrate(query)` is called so the page can run the query right away.
 * - `writeUrl(query)` puts the query into the address bar (replace, so history is not spammed).
 * - `clearUrl()` removes the query from the address bar (used by Reset).
 * - `buildShareUrl(query)` returns the absolute URL for the query, ready to be copied.
 *
 * @param {object} [options]
 * @param {readonly string[]} [options.fields] - Which query fields this page uses (defaults to all of them).
 * @param {(query: QueryFields) => void} [options.onHydrate] - Called after the store was filled from the URL.
 */
export function useQueryUrlSync({ fields = allQueryFields, onHydrate } = {}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const hydrateQuery = useAppStore((state) => state.hydrateQuery);

    // Latest callback / fields without re-running the effect below on every render.
    const onHydrateRef = useRef(onHydrate);
    onHydrateRef.current = onHydrate;
    const fieldsRef = useRef(fields);
    fieldsRef.current = fields;

    // Serialized params we last handled (either read from the URL or written to it). Prevents the same
    // URL from being hydrated twice (React StrictMode) and prevents our own writes from re-running the query.
    const handledParamsRef = useRef(null);

    useEffect(() => {
        const serialized = searchParams.toString();
        if (handledParamsRef.current === serialized) {
            return;
        }
        handledParamsRef.current = serialized;

        if (!hasQueryParams(searchParams)) {
            // A bare URL keeps whatever the user already typed (e.g. when switching between Search and Graph).
            return;
        }

        // Only overwrite the fields this page owns, so e.g. opening /graph/<id>?q=hi keeps the filters that
        // were chosen on the Search page.
        const parsed = searchParamsToQuery(searchParams);
        const partial = {};
        for (const field of fieldsRef.current) {
            partial[field] = parsed[field];
        }
        if (isQueryEmpty(partial)) {
            // Every parameter was invalid (e.g. an unknown streamer in a hand-edited link): behave like a bare URL.
            return;
        }
        hydrateQuery(partial);
        onHydrateRef.current?.(selectQuery(useAppStore.getState()));
    }, [searchParams, hydrateQuery]);

    const toParams = useCallback((query) => queryToSearchParams(pickQueryFields(query, fieldsRef.current)), []);

    const writeUrl = useCallback(
        (query) => {
            const params = toParams(query);
            handledParamsRef.current = params.toString();
            setSearchParams(params, { replace: true });
        },
        [toParams, setSearchParams],
    );

    const clearUrl = useCallback(() => {
        handledParamsRef.current = "";
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

    const buildShareUrl = useCallback(
        (query) => {
            const url = new URL(window.location.href);
            const serialized = toParams(query).toString();
            url.search = serialized ? `?${serialized}` : "";
            url.hash = "";
            return url.toString();
        },
        [toParams],
    );

    return { writeUrl, clearUrl, buildShareUrl };
}
