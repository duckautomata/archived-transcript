import { OpenSlice, AppSliceCreator } from "./types";

export const createOpenSlice: AppSliceCreator<OpenSlice> = (set) => ({
    infoOpen: false,
    helpOpen: false,
    settingsOpen: false,
    setInfoOpen: (isOpen: boolean) => set({ infoOpen: isOpen }),
    setHelpOpen: (isOpen: boolean) => set({ helpOpen: isOpen }),
    setSettingsOpen: (isOpen: boolean) => set({ settingsOpen: isOpen }),
});
