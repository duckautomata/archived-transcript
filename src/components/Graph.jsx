import { useState, useCallback, useMemo, useRef } from "react";
import {
    Typography,
    Box,
    Container,
    CircularProgress,
    Alert,
    FormControlLabel,
    Switch,
    Paper,
    Divider,
    Chip,
    Stack,
    Fade,
    Grid,
    useMediaQuery,
} from "@mui/material";
import SearchFilter from "./SearchFilter";
import Searchbar from "./Searchbar";
import StatCard from "./StatCard";
import QueryActions from "./QueryActions";
import ScrollToTopFab from "./ScrollToTopFab";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraph } from "../logic/api";
import { selectQuery } from "../logic/queryParams";
import { useQueryUrlSync } from "../logic/useQueryUrlSync";
import { copyWithToast } from "../logic/clipboard";
import { usePageTitle } from "../logic/usePageTitle";
import { TrendingUp, BarChart, History, Assessment } from "@mui/icons-material";

/**
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 * @typedef {import('../store/types').QueryFields} QueryFields
 */

const emptySearchMessage = "Search text cannot be empty. Please enter a search term.";

/**
 * A page for graphing all transcripts based on a filter criteria.
 * The query lives in the store and is mirrored into the URL so a graph can be bookmarked and shared.
 */
export default function Graph() {
    const [data, setData] = useState(/** @type {GraphDataPoint[]} */ ([]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isCumulative, setIsCumulative] = useState(false);

    const isMobile = useMediaQuery("(max-width:600px)");
    const resetQuery = useAppStore((state) => state.resetQuery);

    usePageTitle("Graph");

    // Incremented for every request (and on reset) so a slow, superseded response cannot overwrite newer state.
    const requestIdRef = useRef(0);

    /**
     * Fetch the graph data for the given query. The query is passed in (instead of read from a closure)
     * so that the same function can be used for form submits and for URL hydration.
     * @param {QueryFields} query
     */
    const runGraph = useCallback(async (query) => {
        const requestId = ++requestIdRef.current;
        setHasSearched(true);
        setData([]);
        setStats(null);

        if (!query.searchText || query.searchText.trim() === "") {
            setIsLoading(false);
            setError(emptySearchMessage);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await getGraph(query);
            if (requestId !== requestIdRef.current) return;

            if (response && response.result) {
                setData(response.result);

                if (response.result.length > 0) {
                    const totalCount = response.result.reduce((acc, d) => acc + d.y, 0);
                    const maxCount = Math.max(...response.result.map((d) => d.y));
                    setStats({ total: totalCount, max: maxCount });
                }
            }
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            setError(err.message || "Failed to fetch graph data.");
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const { writeUrl, clearUrl, buildShareUrl } = useQueryUrlSync({ onHydrate: runGraph });

    /**
     * Submit handler for the query form (button click or Enter in any field).
     * @param {React.FormEvent<HTMLFormElement>} event
     */
    const handleSubmit = (event) => {
        event.preventDefault();
        const query = selectQuery(useAppStore.getState());
        writeUrl(query);
        runGraph(query);
    };

    /** Clear every field, the URL and the current results. The cumulative toggle is left alone. */
    const handleReset = () => {
        requestIdRef.current += 1; // ignore any response still in flight
        resetQuery();
        clearUrl();
        setIsLoading(false);
        setData([]);
        setStats(null);
        setError(null);
        setHasSearched(false);
    };

    /** Put the query in the address bar and copy the shareable link to the clipboard. */
    const handleShare = () => {
        const query = selectQuery(useAppStore.getState());
        writeUrl(query);
        copyWithToast(buildShareUrl(query), "Link copied to clipboard");
    };

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
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ my: { xs: 2, sm: 4 } }}>
                <Typography
                    color="primary"
                    variant="h5"
                    component="h1"
                    data-testid="graph-title"
                    sx={{ mb: 2, wordBreak: "break-word" }}
                >
                    Graph Transcripts
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: "16px", textAlign: "left" }}>
                        <Searchbar />
                        <SearchFilter />
                        <QueryActions
                            submitLabel="Generate Graph"
                            loadingLabel="Generating Graph..."
                            isLoading={isLoading}
                            submitIcon={<Assessment />}
                            submitTestId="generate-graph"
                            onReset={handleReset}
                            onShare={handleShare}
                        />
                    </Paper>
                </Box>

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
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}
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
                                                    <StatCard
                                                        title="TOTAL MATCHES"
                                                        value={stats.total.toLocaleString()}
                                                        icon={<BarChart />}
                                                        color="#3b82f6"
                                                    />
                                                </Grid>
                                                {!isCumulative && (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                        <StatCard
                                                            title="PEAK DAILY HITS"
                                                            value={stats.max.toLocaleString()}
                                                            icon={<TrendingUp />}
                                                            color="#ec4899"
                                                        />
                                                    </Grid>
                                                )}
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <StatCard
                                                        title="DATA POINTS"
                                                        value={data.length}
                                                        icon={<History />}
                                                        color="#8b5cf6"
                                                    />
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

            <ScrollToTopFab />
        </Container>
    );
}
