import { QuerySlice, AppSliceCreator } from "./types";

export const createQuerySlice: AppSliceCreator<QuerySlice> = (set) => ({
    searchText: "",
    setSearchText: (text) => set({ searchText: text }),
    streamer: "",
    setStreamer: (s) => set({ streamer: s }),
    streamType: [],
    setStreamType: (s) => set({ streamType: s }),
    fromDate: "",
    setFromDate: (date) => set({ fromDate: date }),
    toDate: "",
    setToDate: (date) => set({ toDate: date }),
    streamTitle: "",
    setStreamTitle: (title) => set({ streamTitle: title }),
    matchWholeWord: false,
    setMatchWholeWord: (match) => set({ matchWholeWord: match }),
});
