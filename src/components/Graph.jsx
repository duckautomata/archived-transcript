import { useState, useCallback, useMemo } from "react";
import {
    Typography,
    Box,
    Container,
    Button,
    CircularProgress,
    Alert,
    FormControlLabel,
    Switch,
    Paper,
    Divider,
    Chip,
    Stack,
    alpha,
    Fade,
    Grid,
    useMediaQuery,
} from "@mui/material";
import { useShallow } from "zustand/react/shallow";
import SearchFilter from "./SearchFilter";
import Searchbar from "./Searchbar";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraph } from "../logic/api";
import { TrendingUp, BarChart, History } from "@mui/icons-material";

/**
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 */

/**
 * A page for graphing all transcripts based on a filter criteria.
 */
export default function Graph() {
    const [data, setData] = useState(/** @type {GraphDataPoint[]} */ ([]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isCumulative, setIsCumulative] = useState(false);

    const isMobile = useMediaQuery("(max-width:600px)");

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

    const domain = useMemo(() => {
        if (processedData.length === 0) return [null, null];
        const dates = processedData.map((d) => d.x.getTime());
        return [new Date(Math.min(...dates)), new Date(Math.max(...dates))];
    }, [processedData]);

    return (
        <Container sx={{ padding: 0 }}>
            <Box sx={{ my: 4 }}>
                <Typography
                    color="primary"
                    variant="h5"
                    component="h5"
                    data-testid="graph-title"
                    sx={{ mb: 2, wordBreak: "break-word" }}
                >
                    Graph Transcripts
                </Typography>
                <Searchbar onSearch={handleGraph} />
                <SearchFilter />
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGraph}
                    disabled={isLoading}
                    data-testid="generate-graph"
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
                        <Alert data-testid="input-error" severity="error" sx={{ my: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Show "No data" message only after a search and if not loading/error */}
                    {hasSearched && !isLoading && !error && data.length === 0 && (
                        <Alert data-testid="no-data-error" severity="info" sx={{ my: 2 }}>
                            No data found for the selected criteria.
                        </Alert>
                    )}

                    {/* Show graph and stats if data exists */}
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
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ mb: 3 }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={isCumulative}
                                                    onChange={(e) => setIsCumulative(e.target.checked)}
                                                    color="primary"
                                                    data-testid="cumulative-view-switch"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                    Cumulative View
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            icon={<TrendingUp />}
                                            label={isMobile ? "Insights" : "Search Insights"}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderRadius: "8px" }}
                                        />
                                    </Stack>

                                    {stats && (
                                        <Box sx={{ mb: 4 }}>
                                            <Grid container spacing={isMobile ? 1.5 : 3}>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                                                bgcolor: alpha("#3b82f6", 0.1),
                                                                color: "#3b82f6",
                                                            }}
                                                        >
                                                            <BarChart />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Total Matches
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                                {stats.total.toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                                {!isCumulative && (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                                                    bgcolor: alpha("#ec4899", 0.1),
                                                                    color: "#ec4899",
                                                                }}
                                                            >
                                                                <TrendingUp />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Peak Daily Hits
                                                                </Typography>
                                                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                                    {stats.max.toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                )}
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                                                                bgcolor: alpha("#8b5cf6", 0.1),
                                                                color: "#8b5cf6",
                                                            }}
                                                        >
                                                            <History />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Data Points
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

                                    {/* --- Chart Container --- */}
                                    <Box data-testid="graph-chart" sx={{ height: 500, width: "100%" }}>
                                        <LineChart
                                            dataset={processedData}
                                            margin={{
                                                left: isMobile ? 35 : 60,
                                                right: isMobile ? 15 : 70,
                                                top: 20,
                                                bottom: 60,
                                            }}
                                            series={[
                                                {
                                                    dataKey: "y",
                                                    label: isCumulative ? "Cumulative Matches" : "Matches",
                                                    showMark: false,
                                                    curve: "linear",
                                                    area: isCumulative,
                                                    color: isCumulative ? "#8b5cf6" : "#3b82f6",
                                                },
                                            ]}
                                            xAxis={[
                                                {
                                                    scaleType: "time",
                                                    dataKey: "x",
                                                    label: isMobile ? undefined : "Date Streamed",
                                                    min: domain[0],
                                                    max: domain[1],
                                                    valueFormatter: (date) =>
                                                        date
                                                            ? date.toLocaleString(undefined, { dateStyle: "medium" })
                                                            : "",
                                                    padding: { left: 0, right: 0 },
                                                },
                                            ]}
                                            yAxis={[
                                                {
                                                    label: isMobile ? undefined : "Count",
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
        </Container>
    );
}
