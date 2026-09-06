export const server = import.meta.env.VITE_API_URL;
export const contextLimit = 20;

/** Path the app is served under. Must match `base` in vite.config.js. */
export const basename = "/archived-transcript/";

/** Title used in the browser tab. Pages append their own name in front of it. */
export const baseTitle = import.meta.env.VITE_PAGE_TITLE || "Archived Transcript";

/** Streamers that can be selected in the search filter. */
export const streamers = ["Dokibird", "MintFantome"];

/** Stream types that can be selected in the search filter. */
export const streamTypes = ["Video", "Stream", "Twitch", "Members", "TwitchVod", "External"];
