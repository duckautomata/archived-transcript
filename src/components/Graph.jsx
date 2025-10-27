import { useState, useCallback, useMemo } from "react";
import { Typography, Box, Container, Button, CircularProgress, Alert, FormControlLabel, Switch } from "@mui/material";
import { useShallow } from "zustand/react/shallow";
import SearchFilter from "./SearchFilter";
import Searchbar from "./Searchbar";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraph } from "../logic/api";

/**
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 */

export default function Graph() {
    const [data, setData] = useState(/** @type {GraphDataPoint[]} */ ([]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isCumulative, setIsCumulative] = useState(false);

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

    const handleGraph = useCallback(async () => {
        setHasSearched(true);
        setData([]);
        setStats(null);

        if (!queryParams.searchText || queryParams.searchText.trim() === "") {
            setError("Search text cannot be empty. Please enter a search term.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await getGraph(queryParams);

            if (response && response.result) {
                setData(response.result);

                if (response.result.length > 0) {
                    const totalCount = response.result.reduce((acc, d) => acc + d.y, 0);
                    const maxCount = Math.max(...response.result.map((d) => d.y));
                    setStats({ total: totalCount, max: maxCount });
                }
            }
        } catch (err) {
            setError(err.message || "Failed to fetch graph data.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    const processedData = useMemo(() => {
        if (!isCumulative) {
            return data.map((point) => {
                const [y, m, d] = point.x.split("-").map(Number);
                const newX = new Date(y, m - 1, d); // Month is 0-indexed
                return {
                    x: newX,
                    y: point.y,
                };
            });
        }

        // Calculate cumulative sum
        let cumulativeSum = 0;
        return data.map((point) => {
            const [y, m, d] = point.x.split("-").map(Number);
            const newX = new Date(y, m - 1, d); // Month is 0-indexed

            cumulativeSum += point.y;
            return {
                x: newX,
                y: cumulativeSum,
            };
        });
    }, [data, isCumulative]);

    return (
        <Container sx={{ padding: 0 }}>
            <Box sx={{ my: 4 }}>
                <Typography color="primary" variant="h5" component="h5" sx={{ mb: 2, wordBreak: "break-word" }}>
                    Graph Transcripts
                </Typography>
                <Searchbar />
                <SearchFilter />
                <Button variant="outlined" fullWidth onClick={handleGraph} disabled={isLoading}>
                    {isLoading ? "Graphing..." : "Graph"}
                </Button>

                {/* --- Results Display Area --- */}
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
                    {hasSearched && !isLoading && !error && data.length === 0 && (
                        <Alert severity="info" sx={{ my: 2 }}>
                            No data found for the selected criteria.
                        </Alert>
                    )}

                    {/* Show graph and stats if data exists */}
                    {data.length > 0 && !isLoading && (
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isCumulative}
                                        onChange={(e) => setIsCumulative(e.target.checked)}
                                    />
                                }
                                label="Show Cumulative Sum"
                                sx={{ mb: 1, display: "block" }}
                            />

                            {stats && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" component="h6" gutterBottom>
                                        Graph Statistics
                                    </Typography>
                                    <Typography variant="body1">
                                        <b>Total Hits:</b> {stats.total.toLocaleString()}
                                    </Typography>
                                    {/* Only show "Max Hits" if not in cumulative mode */}
                                    {!isCumulative && (
                                        <Typography variant="body1">
                                            <b>Max Hits (in one day):</b> {stats.max.toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* --- Chart Container --- */}
                            <Box sx={{ height: 500, width: "100%" }}>
                                <LineChart
                                    dataset={processedData}
                                    series={[
                                        {
                                            dataKey: "y",
                                            label: isCumulative ? "Cumulative Count" : "Count",
                                            showMark: false,
                                            curve: "linear",
                                        },
                                    ]}
                                    xAxis={[
                                        {
                                            scaleType: "time",
                                            dataKey: "x",
                                            label: "Date",
                                            valueFormatter: (date) =>
                                                date ? date.toLocaleString(undefined, { dateStyle: "medium" }) : "",
                                        },
                                    ]}
                                    yAxis={[
                                        {
                                            label: isCumulative ? "Cumulative Count" : "Count",
                                            min: 0,
                                        },
                                    ]}
                                    tooltip={{ trigger: "axis" }}
                                    grid={{ vertical: false, horizontal: true }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
}
