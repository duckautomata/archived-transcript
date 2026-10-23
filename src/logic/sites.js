/**
 * The sites the sidebar's site switcher jumps between. The transcript sites share one host, so they are linked by
 * root-relative paths and keep whatever subdomain (www, dev) the visitor is on.
 */

/** Id of this site in `sites`. */
export const CURRENT_SITE_ID = "archived-transcript";

/**
 * @param {string} id - the path segment the site is served under
 * @param {string} title
 */
const site = (id, title) => ({
    id,
    title,
    path: `/${id}/`,
    icon: `/${id}/favicon-32x32.png`,
    icon2x: `/${id}/android-chrome-192x192.png`,
});

/**
 * The transcript sites, in the order the switcher lists them.
 * @type {{ id: string, title: string, path: string, icon: string, icon2x: string }[]}
 */
export const sites = [site("live-transcript", "Live Transcript"), site("archived-transcript", "Archived Transcript")];

/**
 * The landing page that lists every site, on the subdomain this build is deployed to.
 * @param {string} [subDomain]
 * @returns {string}
 */
export const hubUrl = (subDomain = import.meta.env.VITE_SUB_DOMAIN) =>
    `https://${subDomain || "www"}.duck-automata.com/`;
