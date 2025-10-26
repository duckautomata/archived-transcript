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
