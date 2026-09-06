import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { Link as RouterLink, useParams } from "react-router-dom";
import Searchbar from "./Searchbar";
import StatCard from "./StatCard";
import QueryActions from "./QueryActions";
import ScrollToTopFab from "./ScrollToTopFab";
import ExternalLinkDialog from "./ExternalLinkDialog";
import { LineChart } from "@mui/x-charts";
import { useAppStore } from "../store/store";
import { getGraphById, getStreamMetadata } from "../logic/api";
import { secondsToTime, timeToSeconds, toLocalDate } from "../logic/timezone";
import { selectQuery } from "../logic/queryParams";
import { useQueryUrlSync } from "../logic/useQueryUrlSync";
import { copyWithToast } from "../logic/clipboard";
import { usePageTitle } from "../logic/usePageTitle";
import { getTranscriptPath, getVideoUrl } from "../logic/videoLinks";
import {
    Info,
    BarChart,
    History,
    CalendarMonth,
    LocalOffer,
    Person,
    Assessment,
    Description,
    OpenInNew,
} from "@mui/icons-material";

/**
 * @typedef {import('../logic/api').StreamMetadata} StreamMetadata
 * @typedef {import('../logic/api').GraphDataPoint} GraphDataPoint
 * @typedef {import('../store/types').QueryFields} QueryFields
 */

/** The only query fields the single stream graph uses (and mirrors into the URL). */
const graphSingleFields = Object.freeze(["searchText", "matchWholeWord"]);

const emptySearchMessage = "Search text cannot be empty. Please enter a search term.";

/** Shared look of the header action buttons (same as on the transcript page). */
const actionButtonSx = {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: "bold",
    boxShadow: "none",
    "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
};

/**
 * A page for graphing a specific transcript.
 * Shows an error message if the stream metadata call fails (400 or 500).
 * The search text / whole word toggle are mirrored into the URL so a graph can be bookmarked and shared.
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
    const [externalUrl, setExternalUrl] = useState("");

    const isMobile = useMediaQuery("(max-width:600px)");

    const matchWholeWord = useAppStore((state) => state.matchWholeWord);
    const setMatchWholeWord = useAppStore((state) => state.setMatchWholeWord);
    const hydrateQuery = useAppStore((state) => state.hydrateQuery);

    usePageTitle(metadata ? `Graph · ${metadata.streamTitle}` : "Graph");

    // Incremented for every request (and on reset) so a slow, superseded response cannot overwrite newer state.
    const requestIdRef = useRef(0);

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

    /**
     * Fetch the graph data for this stream with the given query. The query is passed in (instead of read
     * from a closure) so that the same function can be used for form submits and for URL hydration.
     * @param {QueryFields} query
     */
    const runGraph = useCallback(
        async (query) => {
            const requestId = ++requestIdRef.current;
            setHasSearched(true);
            setData([]);
            setStats(null);

            if (!id) {
                setIsLoading(false);
                setError("No transcript ID found in URL.");
                return;
            }
            if (!query.searchText || query.searchText.trim() === "") {
                setIsLoading(false);
                setError(emptySearchMessage);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await getGraphById(id, query);
                if (requestId !== requestIdRef.current) return;

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
                if (requestId !== requestIdRef.current) return;
                setError(err.message || "Failed to fetch graph data.");
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [id],
    );

    const { writeUrl, clearUrl, buildShareUrl } = useQueryUrlSync({ fields: graphSingleFields, onHydrate: runGraph });

    /**
     * Submit handler for the query form (button click or Enter in the search field).
     * @param {React.FormEvent<HTMLFormElement>} event
     */
    const handleSubmit = (event) => {
        event.preventDefault();
        const query = selectQuery(useAppStore.getState());
        writeUrl(query);
        runGraph(query);
    };

    /**
     * Clear the fields this page uses, the URL and the current results. Only the search text and the
     * whole word toggle are reset so that filters chosen on the Search page survive.
     */
    const handleReset = () => {
        requestIdRef.current += 1; // ignore any response still in flight
        hydrateQuery({ searchText: "", matchWholeWord: false });
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
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
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
                    <Info color="primary" data-testid="graph-single-error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                        Error: Not Found
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>{metaError.message}</Typography>
                    <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
                        Go Back Home
                    </Button>
                </Box>
            ) : (
                <Box sx={{ my: { xs: 2, sm: 4 } }}>
                    <Typography
                        color="primary"
                        variant="h5"
                        component="h1"
                        data-testid="stream-title"
                        sx={{ mb: 2, wordBreak: "break-word" }}
                    >
                        {metadata ? `Graph: ${metadata.streamTitle}` : "Graph Transcript"}
                    </Typography>

                    {metadata && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: isMobile ? 1.5 : 2,
                                mb: 3,
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
                                useFlexGap
                                divider={<Divider orientation="vertical" flexItem />}
                                sx={{ flexWrap: "wrap" }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Person fontSize="small" color="action" />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {metadata.streamer}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CalendarMonth fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {toLocalDate(metadata.date) || metadata.date}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <LocalOffer fontSize="small" color="action" />
                                    <Chip
                                        label={metadata.streamType}
                                        size="small"
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                            color: "primary.main",
                                            borderRadius: "6px",
                                            height: 20,
                                        }}
                                    />
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2, opacity: 0.6 }} />

                            {/* --- Metadata actions --- */}
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Description />}
                                    component={RouterLink}
                                    to={getTranscriptPath(id)}
                                    data-testid="view-transcript-link"
                                    sx={actionButtonSx}
                                >
                                    View Transcript
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNew />}
                                    onClick={() => setExternalUrl(getVideoUrl(id, metadata.streamType))}
                                    data-testid="open-stream"
                                    sx={actionButtonSx}
                                >
                                    Open Stream
                                </Button>
                            </Stack>
                        </Paper>
                    )}
                    {metaError && (
                        <Alert severity="error" data-testid="metadata-error" sx={{ my: 2 }}>
                            {metaError.message}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: "16px", textAlign: "left" }}>
                            <Searchbar />
                            {/* ml offsets the FormControlLabel's negative margin so the switch lines up with the field */}
                            <Box sx={{ mt: 1, ml: 1.5 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={matchWholeWord}
                                            onChange={(e) => setMatchWholeWord(e.target.checked)}
                                            data-testid="match-whole-word-switch"
                                        />
                                    }
                                    label="Match Whole Word"
                                />
                            </Box>
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
                            <Alert severity="error" data-testid="input-error" sx={{ my: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {hasSearched && !isLoading && !error && data.length === 0 && (
                            <Alert data-testid="no-data-error" severity="info" sx={{ my: 2 }}>
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
                                        }}
                                    >
                                        {stats && (
                                            <Box sx={{ mb: 4 }}>
                                                <Grid container spacing={isMobile ? 1.5 : 3}>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <StatCard
                                                            title="FULL STREAM MATCHES"
                                                            value={stats.total.toLocaleString()}
                                                            icon={<BarChart />}
                                                            color="#10b981"
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <StatCard
                                                            title="RECORDED POINTS"
                                                            value={data.length}
                                                            icon={<History />}
                                                            color="#6366f1"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}

                                        <Divider sx={{ mb: 4, opacity: 0.6 }} />

                                        <Box data-testid="graph-chart" sx={{ height: 400, width: "100%" }}>
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

            <ExternalLinkDialog url={externalUrl} onClose={() => setExternalUrl("")} copyMessage="Video link copied" />
            <ScrollToTopFab />
        </Container>
    );
}
