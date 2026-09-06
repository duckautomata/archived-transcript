// On search, will show all transcripts as an expandable list

import { Alert, Box, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useCallback, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import ExpandableResult from "./ExpandableResult";
import Searchbar from "./Searchbar";
import SearchFilter from "./SearchFilter";
import QueryActions from "./QueryActions";
import ScrollToTopFab from "./ScrollToTopFab";
import { searchTranscripts } from "../logic/api";
import { useAppStore } from "../store/store";
import { selectQuery } from "../logic/queryParams";
import { useQueryUrlSync } from "../logic/useQueryUrlSync";
import { copyWithToast } from "../logic/clipboard";
import { usePageTitle } from "../logic/usePageTitle";

/**
 * @typedef {import('../logic/api').TranscriptSearch} TranscriptSearch
 * @typedef {import('../store/types').QueryFields} QueryFields
 */

/**
 * A page for searching transcripts and displaying results.
 * The query lives in the app store and is mirrored into the URL so a search can be bookmarked or shared.
 */
export default function Search() {
    usePageTitle("Search");
    const resetQuery = useAppStore((state) => state.resetQuery);

    const [searched, setSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamsData, setStreamsData] = useState(/** @type {TranscriptSearch[]} */ ([]));
    const [submittedSearchText, setSubmittedSearchText] = useState("");
    const [expandedItems, setExpandedItems] = useState(new Set());
    const totalStreams = streamsData.length;

    // Incremented for every search (and on reset) so a slow, superseded request cannot overwrite newer results.
    const requestIdRef = useRef(0);

    /**
     * Run a search with the given query and show its results.
     * @param {QueryFields} query
     */
    const runSearch = useCallback(async (query) => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        setSearched(true);
        setError(null);
        setStreamsData([]);
        setExpandedItems(new Set());
        setSubmittedSearchText(query.searchText);

        try {
            const response = await searchTranscripts(query);
            if (requestId !== requestIdRef.current) return;
            if (response && response.result) {
                setStreamsData(response.result);
            }
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            setError(err.message || "Failed to search transcripts.");
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const { writeUrl, clearUrl, buildShareUrl } = useQueryUrlSync({ onHydrate: runSearch });

    /** Submit handler: put the query in the URL and run it. */
    const handleSubmit = (event) => {
        event.preventDefault();
        const query = selectQuery(useAppStore.getState());
        writeUrl(query);
        runSearch(query);
    };

    /** Clear every field, the URL and everything shown below the form. */
    const handleReset = () => {
        requestIdRef.current += 1;
        resetQuery();
        clearUrl();
        setStreamsData([]);
        setSearched(false);
        setIsLoading(false);
        setError(null);
        setExpandedItems(new Set());
        setSubmittedSearchText("");
    };

    /** Copy a link to the current query (and reflect it in the address bar). */
    const handleShare = () => {
        const query = selectQuery(useAppStore.getState());
        writeUrl(query);
        copyWithToast(buildShareUrl(query), "Link copied to clipboard");
    };

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

    const highlightText = submittedSearchText.trim();
    const resultsHeading =
        `Found ${totalStreams} ${totalStreams === 1 ? "stream" : "streams"}` +
        (highlightText ? ` for “${highlightText}”` : "");

    return (
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ my: { xs: 2, sm: 4 } }}>
                <Typography color="primary" variant="h5" component="h1" sx={{ mb: 2, wordBreak: "break-word" }}>
                    Search Transcripts
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: "16px", textAlign: "left" }}>
                        <Searchbar />
                        <SearchFilter />
                        <QueryActions
                            submitLabel="Search"
                            loadingLabel="Searching..."
                            isLoading={isLoading}
                            submitIcon={<SearchIcon />}
                            submitTestId="search-transcript"
                            onReset={handleReset}
                            onShare={handleShare}
                        />
                    </Paper>
                </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
                {!searched && !isLoading && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        data-testid="search-hint"
                        sx={{ textAlign: "center", px: 2 }}
                    >
                        Enter a word or phrase and/or pick filters, then press Search. Leave the text empty to list
                        every stream matching the filters.
                    </Typography>
                )}

                {isLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" data-testid="search-error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Show "No data" message only after a search and if not loading/error */}
                {searched && !isLoading && !error && totalStreams === 0 && (
                    <Alert severity="info" data-testid="no-data-error" sx={{ my: 2 }}>
                        No data found for the selected criteria.
                    </Alert>
                )}

                {/* Show results and stats if data exists */}
                {totalStreams > 0 && !isLoading && (
                    <Box>
                        <Typography
                            variant="h6"
                            data-testid="search-results"
                            sx={{
                                mb: 3,
                                textAlign: "center",
                                color: "text.primary",
                                fontWeight: "bold",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                pb: 1,
                                wordBreak: "break-word",
                            }}
                        >
                            {resultsHeading}
                        </Typography>
                        <Virtuoso
                            useWindowScroll
                            data={streamsData}
                            computeItemKey={(_index, stream) => stream.id}
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

            <ScrollToTopFab />
        </Container>
    );
}
