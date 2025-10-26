import { SettingsSlice, AppSliceCreator } from "./types";

export const createSettingsSlice: AppSliceCreator<SettingsSlice> = (set) => ({
    theme: "system",
    density: "standard",
    timeFormat: "relative",
    newAtTop: true,
    enableTagHelper: false,
    defaultOffset: -20,
    sidebarOpen: true,
    setTheme: (theme) => set({ theme }),
    setDensity: (density) => set({ density }),
    setTimeFormat: (format) => set({ timeFormat: format }),
    setNewAtTop: (value) => set({ newAtTop: value }),
    setEnableTagHelper: (value) => set({ enableTagHelper: value }),
    setDefaultOffset: (offset) => set({ defaultOffset: offset }),
    setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
});
