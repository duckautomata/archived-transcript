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
    const [streamsData, setStreamsData] = useState([]);
    const [submittedSearchText, setSubmittedSearchText] = useState(queryParams.searchText);
    const totalStreams = streamsData.length;

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        setSearched(true);
        setError(null);
        setStreamsData([]);

        try {
            const response = await searchTranscripts(queryParams);
            if (response && response.result) {
                setStreamsData(response.result);
                setSubmittedSearchText(queryParams.searchText);
            }
        } catch (err) {
            setError(err.error || "Failed to fetch graph data.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    return (
        <Container sx={{ padding: 0 }}>
            <Box sx={{ my: 4 }}>
                <Typography color="primary" variant="h5" component="h5" sx={{ mb: 2, wordBreak: "break-word" }}>
                    Search Transcripts
                </Typography>
                <Searchbar />
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
                        <Typography variant="body2" sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}>
                            Found {totalStreams} streams
                        </Typography>
                        <Virtuoso
                            style={{ height: "80vh", marginBottom: "40px" }}
                            data={streamsData}
                            itemContent={(_index, stream) => (
                                <ExpandableResult key={stream.id} stream={stream} targetWord={submittedSearchText} />
                            )}
                        />
                    </Box>
                )}
            </Box>
        </Container>
    );
}
