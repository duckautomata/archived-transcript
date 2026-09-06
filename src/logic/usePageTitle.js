import { useEffect } from "react";
import { baseTitle } from "../config";

/**
 * Set the browser tab title while the calling page is mounted ("Search · Archived Transcript").
 * Passing an empty title shows just the base title.
 * @param {string} [title]
 */
export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} · ${baseTitle}` : baseTitle;
        return () => {
            document.title = baseTitle;
        };
    }, [title]);
}
