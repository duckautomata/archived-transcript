import { ToastSlice, AppSliceCreator } from "./types";

let toastCounter = 0;

/**
 * Small global notification ("Link copied", ...) rendered by <ToastSnackbar /> in App.
 */
export const createToastSlice: AppSliceCreator<ToastSlice> = (set) => ({
    toast: null,
    showToast: (message, severity = "success") => {
        toastCounter += 1;
        set({ toast: { key: toastCounter, message, severity } });
    },
    hideToast: () => set({ toast: null }),
});
