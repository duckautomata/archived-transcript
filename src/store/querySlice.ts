import { QueryFields, QuerySlice, AppSliceCreator } from "./types";

/** Default (empty) values for every query field. */
export const defaultQuery: Readonly<QueryFields> = Object.freeze({
    searchText: "",
    streamer: "",
    streamType: [],
    fromDate: "",
    toDate: "",
    streamTitle: "",
    matchWholeWord: false,
});

export const createQuerySlice: AppSliceCreator<QuerySlice> = (set) => ({
    ...defaultQuery,
    streamType: [],
    setSearchText: (text) => set({ searchText: text }),
    setStreamer: (s) => set({ streamer: s }),
    setStreamType: (s) => set({ streamType: s }),
    setFromDate: (date) => set({ fromDate: date }),
    setToDate: (date) => set({ toDate: date }),
    setStreamTitle: (title) => set({ streamTitle: title }),
    setMatchWholeWord: (match) => set({ matchWholeWord: match }),
    resetQuery: () => set({ ...defaultQuery, streamType: [] }),
    hydrateQuery: (fields) => set({ ...fields }),
});
