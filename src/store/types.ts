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

export interface QuerySlice {
    searchText: string;
    setSearchText: (text: string) => void;
    streamer: string;
    setStreamer: (s: string) => void;
    streamType: string[];
    setStreamType: (s: string[]) => void;
    fromDate: string;
    setFromDate: (date: string) => void;
    toDate: string;
    setToDate: (date: string) => void;
    streamTitle: string;
    setStreamTitle: (title: string) => void;
    matchWholeWord: boolean;
    setMatchWholeWord: (match: boolean) => void;
}

export interface SettingsSlice {
    theme: "light" | "system" | "dark";
    density: "compact" | "standard" | "comfortable";
    timeFormat: "relative" | "local" | "UTC";
    newAtTop: boolean;
    enableTagHelper: boolean;
    defaultOffset: number;
    sidebarOpen: boolean;
    membershipKey: string;
    membershipInfo: { channel: string; expiresAt: string } | null;
    setTheme: (theme: SettingsSlice["theme"]) => void;
    setDensity: (density: SettingsSlice["density"]) => void;
    setTimeFormat: (format: SettingsSlice["timeFormat"]) => void;
    setNewAtTop: (value: boolean) => void;
    setEnableTagHelper: (value: boolean) => void;
    setDefaultOffset: (offset: number) => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setMembershipKey: (key: string) => void;
    setMembershipInfo: (info: SettingsSlice["membershipInfo"]) => void;
}

// The combined store type
export type AppStore = QuerySlice & SettingsSlice;

// Helper type for creating slices
export type AppSliceCreator<T> = StateCreator<AppStore, [], [], T>;
