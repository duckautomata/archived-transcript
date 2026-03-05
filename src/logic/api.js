// --- JSDoc Type Definitions (from Go structs) ---

import { server } from "../config";
import { useAppStore } from "../store/store";

/**
 * @typedef {object} TranscriptLine
 * @property {string} id
 * @property {string} start - hh:mm:ss
 * @property {string} text
 */

/**
 * @typedef {object} TranscriptOutput
 * @property {string} streamer
 * @property {string} date - YYYY-MM-DD
 * @property {string} streamType
 * @property {string} streamTitle
 * @property {string} id
 * @property {TranscriptLine[]} transcriptLines
 */

/**
 * @typedef {object} StreamMetadata
 * @property {string} streamer
 * @property {string} date - YYYY-MM-DD
 * @property {string} streamType
 * @property {string} streamTitle
 * @property {string} id
 */

/**
 * @typedef {object} TranscriptSearch
 * @property {string} id
 * @property {string} streamer
 * @property {string} date
 * @property {string} streamType
 * @property {string} title
 * @property {SearchContext[]} contexts - List of matching snippets
 */

/**
 * @typedef {object} SearchContext
 * @property {string} startTime
 * @property {string} line
 */

/**
 * @typedef {object} TranscriptSearchOutput
 * @property {TranscriptSearch[]} result
 */

/**
 * @typedef {object} GraphDataPoint
 * @property {string} x - Can be "hh:mm:ss" or "YYYY-MM-DD"
 * @property {number} y
 */

/**
 * @typedef {object} GraphOutput
 * @property {GraphDataPoint[]} result
 */

/**
 * @typedef {object} QueryParams
 * @property {string} [searchText]
 * @property {string} [streamTitle]
 * @property {string} [streamer]
 * @property {string} [fromDate] - YYYY-MM-DD
 * @property {string} [toDate] - YYYY-MM-DD
 * @property {string[]} [streamType]
 * @property {boolean} [matchWholeWord]
 */

// --- Helper Functions ---

/**
 * A generic wrapper for the fetch API.
 * @param {string} url - The URL to fetch (path relative to root).
 * @param {RequestInit} [options] - Standard fetch options.
 * @returns {Promise<any>} - The parsed JSON response.
 */
async function apiFetch(url, options = {}) {
    const headers = {
        Accept: "application/json",
        ...options.headers,
    };

    // Inject membership key if available
    const membershipKey = useAppStore.getState().membershipKey;
    if (membershipKey) {
        headers["X-Membership-Key"] = membershipKey;
    }

    const response = await fetch(`${server}${url}`, {
        ...options,
        method: "GET",
        headers,
    });

    if (!response.ok) {
        const defaultErrorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        const errorStatus = response.status;
        let errorMessage = "";
        try {
            // Attempt to get more info from the response body
            const errorData = await response.json();
            errorMessage = errorData.error || defaultErrorMessage;
        } catch {
            errorMessage = defaultErrorMessage;
        }
        const error = new Error(errorMessage);
        error.status = errorStatus;
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

/**
 * Builds a URL query string from a parameters object.
 * @param {object} [params] - The object of query parameters.
 * @returns {string} - A query string (e.g., "?foo=bar&baz=qux") or an empty string.
 */
function buildQueryString(params) {
    if (!params) {
        return "";
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        // Skip null and undefined values
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            // Add each item in the array as a separate parameter
            value.forEach((item) => query.append(key, item));
        } else {
            // Add other values, stringifying them (booleans, numbers)
            query.append(key, value.toString());
        }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
}

// --- API Fetch Functions ---

/**
 * Fetches a single transcript by its ID.
 * GET /transcript/{id}
 * @param {string} id - The ID of the transcript.
 * @returns {Promise<TranscriptOutput>}
 */
export async function getTranscriptById(id) {
    if (!id) throw new Error("Transcript ID is required");
    return apiFetch(`/transcript/${id}`);
}

/**
 * Searches for transcripts based on query parameters.
 * GET /transcripts
 * @param {QueryParams} [params] - The search criteria.
 * @returns {Promise<TranscriptSearchOutput>}
 */
export async function searchTranscripts(params) {
    const queryString = buildQueryString(params);
    return apiFetch(`/transcripts${queryString}`);
}

/**
 * Fetches graph data for a specific transcript, with optional search context.
 * GET /graph/{id}?searchText={string}&matchWholeWord={bool}
 * @param {string} id - The ID of the transcript.
 * @param {object} [params] - Optional search parameters.
 * @param {string} [params.searchText] - Text to search for.
 * @param {boolean} [params.matchWholeWord] - Whether to match whole words.
 * @returns {Promise<GraphOutput>}
 */
export async function getGraphById(id, params = {}) {
    if (!id) throw new Error("Graph ID is required");

    // This endpoint uses a specific subset of parameters
    const specificParams = {
        searchText: params.searchText,
        matchWholeWord: params.matchWholeWord,
    };

    const queryString = buildQueryString(specificParams);

    return apiFetch(`/graph/${id}${queryString}`);
}

/**
 * Fetches global graph data, filtered by query parameters.
 * GET /graph
 * @param {QueryParams} [params] - The search/filter criteria.
 * @returns {Promise<GraphOutput>}
 */
export async function getGraph(params) {
    // This endpoint uses the full set of QueryParams
    const queryString = buildQueryString(params);
    return apiFetch(`/graph${queryString}`);
}

/**
 * Fetches global graph data, filtered by query parameters.
 * GET /graph
 * @param {string} id - The id of the stream
 * @returns {Promise<StreamMetadata>}
 */
export async function getStreamMetadata(id) {
    return apiFetch(`/stream/${id}`);
}

/**
 * Verifies the membership key.
 * @param {string} key
 * @returns {Promise<{channel: string, expiresAt: string}>}
 */
export async function verifyMembershipKey(key) {
    const response = await fetch(`${server}/membership/verify`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "X-Membership-Key": key,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid membership key");
        }
        throw new Error(`Verification failed: ${response.statusText}`);
    }

    return await response.json();
}
