import { StateCreator } from "zustand";

// Data Structure Interfaces
export interface Segment {
    timestamp: number;
    text: string;
}

export interface TranscriptLine {
    id: number;
    segments: Segment[];
    timestamp: number;
}

// Slice Interfaces

export interface OpenSlice {
    infoOpen: boolean;
    helpOpen: boolean;
    settingsOpen: boolean;
    setInfoOpen: (isOpen: boolean) => void;
    setHelpOpen: (isOpen: boolean) => void;
    setSettingsOpen: (isOpen: boolean) => void;
}

/** The fields that make up a search / graph query. */
export interface QueryFields {
    searchText: string;
    streamer: string;
    streamType: string[];
    fromDate: string;
    toDate: string;
    streamTitle: string;
    matchWholeWord: boolean;
}

export interface QuerySlice extends QueryFields {
    setSearchText: (text: string) => void;
    setStreamer: (s: string) => void;
    setStreamType: (s: string[]) => void;
    setFromDate: (date: string) => void;
    setToDate: (date: string) => void;
    setStreamTitle: (title: string) => void;
    setMatchWholeWord: (match: boolean) => void;
    /** Reset every query field back to its default (empty) value. */
    resetQuery: () => void;
    /** Overwrite the given query fields (used when loading a query from the URL). */
    hydrateQuery: (fields: Partial<QueryFields>) => void;
}

export type ToastSeverity = "success" | "info" | "warning" | "error";

export interface Toast {
    /** Unique per toast so that repeated messages re-trigger the snackbar. */
    key: number;
    message: string;
    severity: ToastSeverity;
}

export interface ToastSlice {
    toast: Toast | null;
    showToast: (message: string, severity?: ToastSeverity) => void;
    hideToast: () => void;
}

export interface SettingsSlice {
    theme: "light" | "system" | "dark";
    density: "compact" | "standard" | "comfortable";
    timeFormat: "relative" | "local" | "UTC";
    transcriptHeight: "100%" | "90%" | "75%" | "50%";
    enableTagHelper: boolean;
    defaultOffset: number;
    sidebarOpen: boolean;
    devMode: boolean;
    membershipKey: string;
    membershipInfo: { channel: string; expiresAt: string } | null;
    useVirtualList: boolean;
    setTheme: (theme: SettingsSlice["theme"]) => void;
    setDensity: (density: SettingsSlice["density"]) => void;
    setTimeFormat: (format: SettingsSlice["timeFormat"]) => void;
    setTranscriptHeight: (height: SettingsSlice["transcriptHeight"]) => void;
    setEnableTagHelper: (value: boolean) => void;
    setDefaultOffset: (offset: number) => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setDevMode: (value: boolean) => void;
    setMembershipKey: (key: string) => void;
    setMembershipInfo: (info: SettingsSlice["membershipInfo"]) => void;
    setUseVirtualList: (value: boolean) => void;
}

// The combined store type
export type AppStore = QuerySlice & OpenSlice & SettingsSlice & ToastSlice;

// Helper type for creating slices
export type AppSliceCreator<T> = StateCreator<AppStore, [], [], T>;
