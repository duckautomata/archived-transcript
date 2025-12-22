import { SettingsSlice, AppSliceCreator } from "./types";

export const createSettingsSlice: AppSliceCreator<SettingsSlice> = (set) => ({
    theme: "system",
    density: "standard",
    timeFormat: "relative",
    transcriptHeight: "100%",
    enableTagHelper: false,
    defaultOffset: -20,
    sidebarOpen: true,
    devMode: false,
    membershipKey: "",
    membershipInfo: null,
    setTheme: (theme) => set({ theme }),
    setDensity: (density) => set({ density }),
    setTimeFormat: (format) => set({ timeFormat: format }),
    setTranscriptHeight: (height) => set({ transcriptHeight: height }),
    setEnableTagHelper: (value) => set({ enableTagHelper: value }),
    setDefaultOffset: (offset) => set({ defaultOffset: offset }),
    setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
    setDevMode: (value) => set({ devMode: value }),
    setMembershipKey: (key) => set({ membershipKey: key }),
    setMembershipInfo: (info) => set({ membershipInfo: info }),
});
