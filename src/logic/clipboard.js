import { useAppStore } from "../store/store";

/**
 * Copy text to the clipboard. Uses the async Clipboard API when available (secure contexts) and falls
 * back to a hidden textarea + execCommand for older browsers / plain http.
 * @param {string} text
 * @returns {Promise<boolean>} true when the text was copied
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall through to the legacy approach
    }

    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        return copied;
    } catch {
        return false;
    }
}

/**
 * Copy text to the clipboard and show a toast telling the user whether it worked.
 * @param {string} text
 * @param {string} [successMessage]
 * @returns {Promise<boolean>}
 */
export async function copyWithToast(text, successMessage = "Copied to clipboard") {
    const copied = await copyToClipboard(text);
    const showToast = useAppStore.getState().showToast;
    if (copied) {
        showToast(successMessage, "success");
    } else {
        showToast("Could not copy to clipboard", "error");
    }
    return copied;
}
