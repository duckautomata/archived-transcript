// On search, will show all transcripts as an expandable list

import { Typography, Box, Container, Button, CircularProgress, Alert } from "@mui/material";
import ExpandableResult from "./ExpandableResult";
import Searchbar from "./Searchbar";
import SearchFilter from "./SearchFilter";
import { useCallback, useState } from "react";
import { searchTranscripts } from "../logic/api";
import { useAppStore } from "../store/store";
import { useShallow } from "zustand/shallow";
import { Virtuoso } from "react-virtuoso";
import { Fab, Zoom, useScrollTrigger } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";

/**
 * @typedef {import('../logic/api').TranscriptSearch} TranscriptSearch
 */

/**
 * A page for searching transcripts and displaying results.
 */
export default function Search() {
    const queryParams = useAppStore(
        useShallow((state) => {
            return {
                searchText: state.searchText,
                streamer: state.streamer,
                streamType: state.streamType,
                fromDate: state.fromDate,
                toDate: state.toDate,
                streamTitle: state.streamTitle,
                matchWholeWord: state.matchWholeWord,
            };
        }),
    );

    const [searched, setSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamsData, setStreamsData] = useState(/** @type {TranscriptSearch[]} */ ([]));
    const [submittedSearchText, setSubmittedSearchText] = useState(queryParams.searchText);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const totalStreams = streamsData.length;

    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 300,
    });

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    };

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        setSearched(true);
        setError(null);
        setStreamsData([]);
        setExpandedItems(new Set());

        try {
            const response = await searchTranscripts(queryParams);
            if (response && response.result) {
                setStreamsData(response.result);
                setSubmittedSearchText(queryParams.searchText);
            }
        } catch (err) {
            setError(err.message || "Failed to search transcripts.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    const handleToggleResult = useCallback((id, isOpen) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (isOpen) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    return (
        <Container sx={{ padding: 0 }}>
            <Box sx={{ my: 4 }}>
                <Typography color="primary" variant="h5" component="h5" sx={{ mb: 2, wordBreak: "break-word" }}>
                    Search Transcripts
                </Typography>
                <Searchbar onSearch={handleSearch} />
                <SearchFilter />
                <Button variant="outlined" onClick={handleSearch} disabled={isLoading} fullWidth>
                    {isLoading ? "Searching..." : "Search"}
                </Button>
            </Box>
            <Box sx={{ mt: 4 }}>
                {isLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Show "No data" message only after a search and if not loading/error */}
                {searched && !isLoading && !error && totalStreams === 0 && (
                    <Alert severity="info" sx={{ my: 2 }}>
                        No data found for the selected criteria.
                    </Alert>
                )}

                {/* Show results and stats if data exists */}
                {totalStreams > 0 && !isLoading && (
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 3,
                                textAlign: "center",
                                color: "text.primary",
                                fontWeight: "bold",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                pb: 1,
                            }}
                        >
                            Found {totalStreams} streams
                        </Typography>
                        <Virtuoso
                            useWindowScroll
                            data={streamsData}
                            itemContent={(_index, stream) => (
                                <ExpandableResult
                                    key={stream.id}
                                    stream={stream}
                                    targetWord={submittedSearchText}
                                    isExpanded={expandedItems.has(stream.id)}
                                    onToggle={(isOpen) => handleToggleResult(stream.id, isOpen)}
                                />
                            )}
                        />
                    </Box>
                )}
            </Box>

            <Zoom in={trigger}>
                <Fab
                    color="primary"
                    size="small"
                    aria-label="scroll back to top"
                    onClick={scrollToTop}
                    sx={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        boxShadow: 3,
                    }}
                >
                    <KeyboardArrowUp />
                </Fab>
            </Zoom>
        </Container>
    );
}
