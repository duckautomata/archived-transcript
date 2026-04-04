import { useState, useCallback, useMemo, useEffect } from "react";
import {
    Typography,
    Box,
    Container,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Chip,
    Stack,
    alpha,
    Fade,
    Grid,
    useMediaQuery,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import Searchbar from "./Searchbar";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraphById, getStreamMetadata } from "../logic/api";
import { secondsToTime, timeToSeconds } from "../logic/timezone";
import { Info, BarChart, History, CalendarMonth, LocalOffer, Person } from "@mui/icons-material";

/**
 * @typedef {import('../logic/api').StreamMetadata} StreamMetadata
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 */

/**
 * A page for graphing a specific transcript.
 * Shows an error message if the stream metadata call fails (400 or 500).
 */
export default function GraphSingle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [metadata, setMetadata] = useState(/** @type {StreamMetadata | null} */ (null));
    const [metaError, setMetaError] = useState(null); // Separate error for metadata fetch
    const [data, setData] = useState(/** @type {GraphDataPoint[]} */ ([]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const isMobile = useMediaQuery("(max-width:600px)");

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
            setMetaError({
                message: "No transcript ID found in URL.",
                status: 404,
            });
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
                    setMetaError({
                        message: err.message || "Failed to fetch stream metadata.",
                        status: err.status || null,
                    });
                }
            }
        }

        fetchMetadata();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleGraph = useCallback(async () => {
        setHasSearched(true);
        setData([]);
        setStats(null);

        if (!id) {
            setError("No transcript ID found in URL.");

            return;
        }
        if (queryParams.searchText === "") {
            setError("Search text cannot be empty. Please enter a search term.");
            return;
        }

        setIsLoading(true);
        setError(null);
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
            setError(err.message || "Failed to fetch graph data.");
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

    const domain = useMemo(() => {
        if (processedData.length === 0) return [0, 0];
        const times = processedData.map((point) => point.x);
        return [Math.min(...times), Math.max(...times)];
    }, [processedData]);

    return (
        <Container sx={{ padding: 0 }}>
            {metaError?.status === 404 ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        height: "50vh",
                    }}
                >
                    <Info color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                        404 Not Found
                    </Typography>
                    <Typography color="text.secondary">{metaError.message}</Typography>
                    <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>
                        Go Back Home
                    </Button>
                </Box>
            ) : (
                <Box sx={{ my: 4 }}>
                    <Typography color="primary" variant="h5" component="h5" sx={{ mb: 2, wordBreak: "break-word" }}>
                        {metadata ? `Graph: ${metadata.streamTitle}` : "Graph Transcript"}
                    </Typography>

                    {metadata && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: isMobile ? 1.5 : 2,
                                mb: 3,
                                // center div
                                borderRadius: "12px",
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                            }}
                        >
                            {metadata.streamType === "Members" && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        mb: 2,
                                        backgroundColor: alpha("#ef4444", 0.05),
                                        border: "1px solid",
                                        borderColor: alpha("#ef4444", 0.2),
                                        borderRadius: "8px",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ fontWeight: "bold", display: "block" }}
                                    >
                                        Members-only content: For personal use only. Do not share.
                                    </Typography>
                                </Paper>
                            )}
                            <Stack
                                direction={isMobile ? "column" : "row"}
                                spacing={isMobile ? 1 : 2}
                                divider={<Divider orientation="vertical" flexItem />}
                                sx={{ flexWrap: "wrap", gap: 1 }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Person fontSize="small" color="action" />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {metadata.streamer}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarMonth fontSize="small" color="action" />
                                    <Typography variant="body2">{metadata.date}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocalOffer fontSize="small" color="action" />
                                    <Chip
                                        label={metadata.streamType}
                                        size="small"
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: alpha("#3b82f6", 0.1),
                                            color: "#3b82f6",
                                            borderRadius: "6px",
                                            height: 20,
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>
                    )}
                    {metaError && (
                        <Alert severity="error" sx={{ my: 2 }}>
                            {metaError}
                        </Alert>
                    )}

                    <Searchbar />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGraph}
                        disabled={isLoading}
                        sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: "12px",
                            fontWeight: "bold",
                            boxShadow: "none",
                            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
                        }}
                    >
                        {isLoading ? "Generating Graph..." : "Generate Graph"}
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
                            <Fade in={data.length > 0}>
                                <Box>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: isMobile ? 0.5 : 3,
                                            mb: 4,
                                            borderRadius: isMobile ? "8px" : "16px",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            background: (theme) =>
                                                `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                                            backdropFilter: "blur(8px)",
                                        }}
                                    >
                                        {stats && (
                                            <Box sx={{ mb: 4 }}>
                                                <Grid container spacing={isMobile ? 1.5 : 3}>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: "12px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    borderRadius: "8px",
                                                                    bgcolor: alpha("#10b981", 0.1),
                                                                    color: "#10b981",
                                                                }}
                                                            >
                                                                <BarChart />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Full Stream Matches
                                                                </Typography>
                                                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                                    {stats.total.toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: "12px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    borderRadius: "8px",
                                                                    bgcolor: alpha("#6366f1", 0.1),
                                                                    color: "#6366f1",
                                                                }}
                                                            >
                                                                <History />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Recorded Points
                                                                </Typography>
                                                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                                    {data.length}
                                                                </Typography>
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}

                                        <Divider sx={{ mb: 4, opacity: 0.6 }} />

                                        <Box sx={{ height: 400, width: "100%" }}>
                                            <LineChart
                                                dataset={processedData}
                                                margin={{
                                                    left: isMobile ? 35 : 60,
                                                    right: isMobile ? 15 : 30,
                                                    top: 20,
                                                    bottom: 60,
                                                }}
                                                series={[
                                                    {
                                                        dataKey: "y",
                                                        label: isMobile ? undefined : "Cumulative Matches",
                                                        showMark: false,
                                                        curve: "linear",
                                                        area: true,
                                                        color: "#10b981",
                                                    },
                                                ]}
                                                xAxis={[
                                                    {
                                                        scaleType: "linear",
                                                        dataKey: "x",
                                                        label: isMobile ? undefined : "Stream Time",
                                                        min: domain[0],
                                                        max: domain[1],
                                                        valueFormatter: (v) => (v != null ? secondsToTime(v) : ""),
                                                        padding: { left: 0, right: 0 },
                                                    },
                                                ]}
                                                yAxis={[
                                                    {
                                                        label: isMobile ? undefined : "Matches",
                                                        min: 0,
                                                    },
                                                ]}
                                                tooltip={{ trigger: "axis" }}
                                                slotProps={{
                                                    legend: {
                                                        hidden: isMobile,
                                                    },
                                                }}
                                                grid={{ vertical: false, horizontal: true }}
                                            />
                                        </Box>
                                    </Paper>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Box>
            )}
        </Container>
    );
}
