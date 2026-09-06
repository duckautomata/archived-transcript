import { basename } from "../config";
import { timeToSeconds } from "./timezone";

/**
 * Build the URL of the original video, optionally at a "hh:mm:ss" timestamp.
 * Twitch VODs use `?t=1h2m3s`, everything else is treated as YouTube (`&t=123s`).
 * @param {string} id - Video / stream id
 * @param {string} streamType - e.g. "Twitch", "Stream", "Video"
 * @param {string} [timestamp] - "hh:mm:ss"
 * @returns {string}
 */
export function getVideoUrl(id, streamType, timestamp) {
    if (streamType === "Twitch") {
        if (!timestamp) return `https://www.twitch.tv/videos/${id}`;
        const [h, m, s] = timestamp.split(":");
        return `https://www.twitch.tv/videos/${id}?t=${h}h${m}m${s}s`;
    }
    if (!timestamp) return `https://www.youtube.com/watch?v=${id}`;
    return `https://www.youtube.com/watch?v=${id}&t=${timeToSeconds(timestamp)}s`;
}

/**
 * Encode a "hh:mm:ss" timestamp into the hash used to deep link to a transcript line ("#T00-12-34").
 * @param {string} timestamp
 * @returns {string}
 */
export function timestampToHash(timestamp) {
    return `#T${timestamp.replace(/:/g, "-")}`;
}

/**
 * Decode a line hash ("#T00-12-34") back into "00:12:34". Returns null for any other hash.
 * @param {string} hash - window.location.hash, including the leading "#"
 * @returns {string|null}
 */
export function hashToTimestamp(hash) {
    if (!hash || !hash.startsWith("#T")) return null;
    const timestamp = hash.substring(2).replace(/-/g, ":");
    return /^\d{2}:\d{2}:\d{2}$/.test(timestamp) ? timestamp : null;
}

/**
 * In-app path (without the basename) of a transcript, optionally deep linking to a line.
 * @param {string} id
 * @param {string} [timestamp] - "hh:mm:ss"
 * @returns {string}
 */
export function getTranscriptPath(id, timestamp) {
    return timestamp ? `/transcript/${id}${timestampToHash(timestamp)}` : `/transcript/${id}`;
}

/**
 * In-app path (without the basename) of the single stream graph.
 * @param {string} id
 * @returns {string}
 */
export function getGraphPath(id) {
    return `/graph/${id}`;
}

/**
 * Turn an in-app path ("/transcript/abc#T00-01-02" or "/search?q=hi") into a full, shareable URL.
 * @param {string} path
 * @returns {string}
 */
export function toAbsoluteUrl(path) {
    const relative = path.startsWith("/") ? path.substring(1) : path;
    return new URL(`${basename}${relative}`, window.location.origin).toString();
}
