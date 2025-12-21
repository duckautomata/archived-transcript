/**
 * Convert a YYYY-MM-DD string to a Date in the local timezone.
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {Date|null} Local Date object or null if invalid.
 */
export const toLocalDate = (dateStr) => {
    if (dateStr === "") {
        return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return null;
    }

    const [year, month, day] = dateStr.split("-").map(Number);

    // Create a Date in local time (month is 0-based)
    return new Date(year, month - 1, day).toLocaleString(undefined, { dateStyle: "medium" });
};

/**
 * Converts "hh:mm:ss" string to total seconds.
 * @param {string} timeStr
 * @returns {number}
 */
export const timeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    try {
        const [h, m, s] = timeStr.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    } catch {
        return 0;
    }
};

/**
 * Converts total seconds to "hh:mm:ss" string.
 * @param {number} totalSeconds
 * @returns {string}
 */
export const secondsToTime = (totalSeconds) => {
    if (typeof totalSeconds !== "number" || isNaN(totalSeconds)) {
        return "";
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    // Pad with zeros
    const pad = (num) => num.toString().padStart(2, "0");

    return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Formats an ISO expiration date string to "Month Day(ordinal), Year in X days".
 * @param {string} isoDateStr - ISO 8601 date string.
 * @returns {string} Formatted string.
 */
export const formatExpirationDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = new Date(isoDateStr);
    if (isNaN(date.getTime())) return "";

    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const dayStr = `${day}${getOrdinal(day)}`;

    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let daysString = "";
    if (diffDays > 0) {
        daysString = ` in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
    } else if (diffDays === 0) {
        daysString = " today";
    } else {
        daysString = ` ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
    }

    return `${month} ${dayStr}, ${year} — ${daysString}`;
};
