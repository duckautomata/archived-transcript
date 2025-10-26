import { useState, useCallback, useMemo, useEffect } from "react";
import { Typography, Box, Container, Button, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import Searchbar from "./Searchbar";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraphById, getStreamMetadata } from "../logic/api";
import { secondsToTime, timeToSeconds } from "../logic/timezone";

/**
 * @typedef {import('../logic/api').StreamMetadata} StreamMetadata
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 */

export default function GraphSingle() {
    const { id } = useParams();
    const [metadata, setMetadata] = useState(/** @type {StreamMetadata | null} */ (null));
    const [metaError, setMetaError] = useState(null); // Separate error for metadata fetch
    const [data, setData] = useState(/** @type {GraphDataPoint[]} */ ([]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const queryParams = useAppStore(
        useShallow((state) => {
            return {
                searchText: state.searchText,
                streamer: state.streamer,
                streamType: state.streamType,
                from: state.fromDate,
                to: state.toDate,
                streamTitle: state.streamTitle,
                matchWholeWord: state.matchWholeWord,
            };
        }),
    );

    useEffect(() => {
        if (!id) {
            setMetaError("No transcript ID found in URL.");
            return;
        }

        let isMounted = true;
        setMetaError(null);
        async function fetchMetadata() {
            try {
                const meta = await getStreamMetadata(id);
                if (isMounted) {
                    setMetadata(meta);
                }
            } catch (err) {
                if (isMounted) {
                    setMetaError(`Failed to fetch stream metadata: ${err.message}`);
                }
            }
        }

        fetchMetadata();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleGraph = useCallback(async () => {
        if (!id) {
            setError("No transcript ID found in URL.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setData([]);
        setStats(null);
        setHasSearched(true);

        try {
            const response = await getGraphById(id, queryParams);

            if (response && response.result) {
                setData(response.result);

                if (response.result.length > 0) {
                    const totalCount = response.result.reduce((acc, d) => acc + d.y, 0);
                    const maxCount = Math.max(...response.result.map((d) => d.y));
                    setStats({ total: totalCount, max: maxCount });
                }
            } else {
                setData([]);
            }
        } catch (err) {
            setError(err.error || "Failed to fetch graph data.");
        } finally {
            setIsLoading(false);
        }
    }, [id, queryParams]);

    const processedData = useMemo(() => {
        if (!data.length) {
            return [];
        }

        let cumulativeSum = 0;

        return data.map((point) => {
            const newX = timeToSeconds(point.x);

            cumulativeSum += point.y;
            return {
                x: newX,
                y: cumulativeSum,
            };
        });
    }, [data]);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography color="primary" variant="h5" component="h5" sx={{ mb: 2, wordBreak: "break-word" }}>
                    {metadata ? `Graph: ${metadata.streamTitle}` : "Graph Transcript"}
                </Typography>

                {metadata && (
                    <Box sx={{ mb: 2, typography: "body2", color: "text.secondary", pl: 0.5 }}>
                        <Typography variant="body2">
                            <b>Streamer:</b> {metadata.streamer} {" - "}
                            <b>Date:</b> {metadata.date} {" - "}
                            <b>Type:</b> {metadata.streamType}
                        </Typography>
                    </Box>
                )}
                {metaError && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {metaError}
                    </Alert>
                )}

                <Searchbar />
                <Button variant="outlined" sx={{ minWidth: 300 }} onClick={handleGraph} disabled={isLoading}>
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

                    {hasSearched && !isLoading && !error && data.length === 0 && (
                        <Alert severity="info" sx={{ my: 2 }}>
                            No data found for the selected criteria.
                        </Alert>
                    )}

                    {data.length > 0 && !isLoading && (
                        <Box>
                            {stats && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" component="h6" gutterBottom>
                                        Graph Statistics
                                    </Typography>
                                    <Typography variant="body1">
                                        <b>Total Hits:</b> {stats.total.toLocaleString()}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ height: 400, width: "100%" }}>
                                <LineChart
                                    dataset={processedData}
                                    series={[
                                        {
                                            dataKey: "y",
                                            label: "Cumulative Count",
                                            showMark: false,
                                            curve: "linear",
                                        },
                                    ]}
                                    xAxis={[
                                        {
                                            scaleType: "linear",
                                            dataKey: "x",
                                            label: "Time",
                                            valueFormatter: secondsToTime,
                                        },
                                    ]}
                                    yAxis={[
                                        {
                                            label: "Cumulative Count",
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
