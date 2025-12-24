import { useEffect, useState } from "react";

/* global __BUILD_TIME__ */

/**
 * Hook to poll for version updates.
 * Compares the build time of the current application with the build time in version.json.
 */
export const useVersionCheck = (intervalMs = 5 * 60 * 1000) => {
    // Default to 5 minutes
    const [updateAvailable, setUpdateAvailable] = useState(false);

    const checkVersion = async () => {
        try {
            // Fetch version.json from the root
            const response = await fetch("/archived-transcript/version.json", {
                cache: "no-store", // Ensure we don't get a cached version
            });
            if (!response.ok) return;

            const data = await response.json();

            // __BUILD_TIME__ is injected by Vite at build time
            if (typeof __BUILD_TIME__ !== "undefined" && data.buildTime > __BUILD_TIME__) {
                console.log("Update available!", data.buildTime, __BUILD_TIME__); // eslint-disable-line no-console
                setUpdateAvailable(true);
            }
        } catch (error) {
            console.error("Failed to check for updates:", error); // eslint-disable-line no-console
        }
    };

    useEffect(() => {
        // Only run if not in development or if explicitly allowed
        // (Vite's HMR usually handles dev updates)
        if (import.meta.env.DEV) {
            return;
        }

        // Initial check
        checkVersion();

        const interval = setInterval(checkVersion, intervalMs);
        return () => clearInterval(interval);
    }, [intervalMs]);

    return { updateAvailable };
};
