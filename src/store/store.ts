import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AppStore } from "./types";
import { createQuerySlice } from "./querySlice";
import { createSettingsSlice } from "./settingsSlice";

export const useAppStore = create<AppStore>()(
    persist(
        (set, get, api) => ({
            ...createQuerySlice(set, get, api),
            ...createSettingsSlice(set, get, api),
        }),
        {
            name: "live-transcript-settings", // The key in localStorage
            // We only want to persist the 'settings' slice of our state
            partialize: (state) => ({
                theme: state.theme,
                density: state.density,
                timeFormat: state.timeFormat,
                transcriptHeight: state.transcriptHeight,
                enableTagHelper: state.enableTagHelper,
                defaultOffset: state.defaultOffset,
                sidebarOpen: state.sidebarOpen,
                devMode: state.devMode,
                membershipKey: state.membershipKey,
                membershipInfo: state.membershipInfo,
            }),
        },
    ),
);
