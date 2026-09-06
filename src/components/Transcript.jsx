import {
    CalendarMonth,
    Clear,
    ContentCopy,
    ErrorOutlined,
    Info,
    Link as LinkIcon,
    LocalOffer,
    OpenInNew,
    Person,
    Search,
    Timeline,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    alpha,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { memo, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Virtuoso } from "react-virtuoso";
import { getTranscriptById } from "../logic/api";
import { copyWithToast } from "../logic/clipboard";
import { toLocalDate } from "../logic/timezone";
import { usePageTitle } from "../logic/usePageTitle";
import {
    getGraphPath,
    getTranscriptPath,
    getVideoUrl,
    hashToTimestamp,
    timestampToHash,
    toAbsoluteUrl,
} from "../logic/videoLinks";
import { useAppStore } from "../store/store";
import ExternalLinkDialog from "./ExternalLinkDialog";
import LineActionsDialog from "./LineActionsDialog";
import ScrollToTopFab from "./ScrollToTopFab";
import TranscriptSkeleton from "./TranscriptSkeleton";

const HighlightedText = styled("span")(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 0, 0.4)" : "rgba(255, 255, 0, 0.8)",
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    borderRadius: "2px",
    padding: "0 2px",
    textDecoration: "underline",
}));

/** Shared look of the small header action buttons. */
const actionButtonSx = {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: "bold",
    boxShadow: "none",
    "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
};

/**
 * Memoized line of a transcript
 * @param {Object} props
 * @param {string} props.id - The id of the line
 * @param {string} props.start - The "hh:mm:ss" timestamp of the start of the line
 * @param {string} props.text - The text of the line
 * @param {string} props.searchTerm - The term to highlight in the text
 * @param {function} props.handleClick - Called with (start, text) when the line action button is clicked
 */
const Line = memo(
    /**
     * Memoized line of a transcript
     * @param {Object} props
     * @param {string} props.id - The id of the line
     * @param {string} props.start - The "hh:mm:ss" timestamp of the start of the line
     * @param {string} props.text - The text of the line
     * @param {string} props.searchTerm - The term to highlight in the text
     * @param {function} props.handleClick - Called with (start, text) when the line action button is clicked
     */
    function Line({ id, start, text, searchTerm, handleClick }) {
        const theme = useTheme();
        const density = useAppStore((state) => state.density);

        const iconColor = theme.palette.id.main;
        const iconSize = density === "comfortable" ? "medium" : "small";
        const iconSx = density === "compact" ? { padding: 0 } : {};

        // Highlighting logic
        const highlightedContent = useMemo(() => {
            if (!searchTerm || !searchTerm.trim()) {
                return text;
            }

            try {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
                // Splitting on a capturing group puts every match at an odd index
                return text
                    .split(regex)
                    .map((part, index) =>
                        index % 2 === 1 ? <HighlightedText key={index}>{part}</HighlightedText> : part,
                    );
            } catch {
                return text;
            }
        }, [text, searchTerm]);

        return (
            <Box
                id={id}
                data-testid={`line-${id}`}
                sx={{
                    padding: "1px 0",
                    "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                    },
                }}
            >
                <Typography
                    color="secondary"
                    style={{ wordBreak: "break-word", textAlign: "left", whiteSpace: "pre-wrap" }}
                >
                    <Tooltip title="Line actions">
                        <IconButton
                            size={iconSize}
                            data-testid={`line-button-${id}`}
                            sx={{ ...iconSx, verticalAlign: "middle" }}
                            onClick={() => handleClick(start, text)}
                        >
                            <LinkIcon style={{ color: iconColor }} />
                        </IconButton>
                    </Tooltip>{" "}
                    <Link
                        component={RouterLink}
                        to={{ hash: timestampToHash(start) }}
                        underline="hover"
                        data-testid={`line-anchor-${id}`}
                        title="Link to this line"
                        sx={{ color: theme.palette.timestamp.main, fontVariantNumeric: "tabular-nums" }}
                    >
                        [{start}]
                    </Link>{" "}
                    {highlightedContent}
                </Typography>
            </Box>
        );
    },
);

/**
 * A page that renders the transcript component based on the id in the url.
 */
export default function Transcript() {
    const { id } = useParams();
    const location = useLocation();
    const virtuosoRef = useRef(null);
    const isMobile = useMediaQuery("(max-width:768px)");
    const searchInputRef = useRef(null);

    const [date, setDate] = useState("");
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [streamer, setStreamer] = useState("");
    const [transcriptLines, setTranscriptLines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [lineAction, setLineAction] = useState({ timestamp: "", text: "" });
    const [lineDialogOpen, setLineDialogOpen] = useState(false);
    const [externalUrl, setExternalUrl] = useState("");

    usePageTitle(streamTitle);

    const isFiltering = searchTerm !== "";
    const filteredTranscriptLines = useMemo(() => {
        if (searchTerm === "") {
            return transcriptLines;
        }
        const term = searchTerm.toLowerCase();
        return transcriptLines.filter((line) => line.text.toLowerCase().includes(term));
    }, [transcriptLines, searchTerm]);

    // Latest rendered list for the hash effect below, without re-running it on every keystroke in the filter.
    const filteredLinesRef = useRef(filteredTranscriptLines);
    filteredLinesRef.current = filteredTranscriptLines;

    const lineVideoUrl = lineAction.timestamp ? getVideoUrl(id, streamType, lineAction.timestamp) : "";
    const linePath = getTranscriptPath(id, lineAction.timestamp);

    /** Opens the line action dialog for the clicked line. Stable so memoized lines do not re-render. */
    const handleLineClick = useCallback((timestamp, text) => {
        setLineAction({ timestamp, text });
        setLineDialogOpen(true);
    }, []);

    /** Closes the line action dialog (the line details are kept so the closing animation does not flicker). */
    const closeLineDialog = () => {
        setLineDialogOpen(false);
    };

    /** "Jump to line" shows the line in the full transcript, so drop any active filter first. */
    const handleJumpToLine = () => {
        setSearchTerm("");
    };

    /** Clears the filter and puts the cursor back into the field. */
    const handleClearFilter = () => {
        setSearchTerm("");
        searchInputRef.current?.focus();
    };

    /** Copies the shareable URL of this transcript. */
    const handleCopyTranscriptLink = () => {
        copyWithToast(toAbsoluteUrl(getTranscriptPath(id)), "Transcript link copied");
    };

    /** Asks for confirmation before opening the original video in a new tab. */
    const handleOpenStream = () => {
        setExternalUrl(getVideoUrl(id, streamType));
    };

    // Fetch transcript at page load
    useEffect(() => {
        let isMounted = true;

        async function fetchTranscript() {
            setIsLoading(true);
            setError(null);
            setTranscriptLines([]);
            setSearchTerm("");

            try {
                const data = await getTranscriptById(id);
                if (isMounted) {
                    setDate(data.date);
                    setStreamTitle(data.streamTitle);
                    setStreamType(data.streamType);
                    setStreamer(data.streamer);
                    setTranscriptLines(data.transcriptLines || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError({
                        message: err.message || "Failed to fetch transcript data.",
                        status: err.status || null,
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchTranscript();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Scroll to and highlight the line named in the hash. location.key makes re-navigating to the same hash
    // (clicking the same timestamp twice) scroll again. The index is looked up in the list that is actually
    // rendered, so clicking a timestamp while filtering keeps the filter.
    useEffect(() => {
        if (isLoading || transcriptLines.length === 0) {
            return;
        }

        const targetTime = hashToTimestamp(location.hash);
        if (!targetTime) {
            return;
        }

        const lines = filteredLinesRef.current;
        const targetIndex = lines.findIndex((line) => line.start === targetTime);
        const targetLineId = lines[targetIndex]?.id;

        if (targetIndex === -1 || !targetLineId) {
            return;
        }

        const timers = [];
        const schedule = (fn, ms) => timers.push(setTimeout(fn, ms));

        // The virtualized list measures itself shortly after the first render, so a single early
        // scrollToIndex can land in the wrong place on slow devices. Scroll, check that the line exists,
        // and try again (a few times, with a longer wait) when it does not.
        const attemptScroll = (attemptsLeft) => {
            if (!virtuosoRef.current) {
                return;
            }
            // Centered so the line is never hidden behind the sticky members banner and has some context above it
            virtuosoRef.current.scrollToIndex({
                index: targetIndex,
                align: "center",
            });

            schedule(() => {
                const element = document.getElementById(targetLineId);
                if (!element) {
                    if (attemptsLeft > 0) {
                        attemptScroll(attemptsLeft - 1);
                    }
                    // Otherwise rendering is taking too long, so we skip the highlight
                    return;
                }

                element.classList.add("highlight");

                // remove highlight after 2 seconds
                schedule(() => {
                    element.classList.remove("highlight");
                }, 2000);
            }, 150);
        };

        // Wait for all divs to be rendered, then scroll into view
        schedule(() => attemptScroll(3), 100);

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [isLoading, transcriptLines, location.hash, location.key]);

    // Override Ctrl+F to focus search input
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "f") {
                event.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    searchInputRef.current.select();
                }
            } else if (event.key === "Escape") {
                if (searchInputRef.current && document.activeElement === searchInputRef.current) {
                    searchInputRef.current.blur();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Leave room for the floating menu button on small screens
    const containerSx = { pt: { xs: 5, md: 1 } };

    if (isLoading) {
        return (
            <Container maxWidth="lg" disableGutters sx={containerSx}>
                <TranscriptSkeleton />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" disableGutters sx={containerSx}>
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
                    {error.status === 404 ? (
                        <>
                            <Info color="primary" data-testid="404-transcript" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                                Error: Not Found
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>{error.message}</Typography>
                        </>
                    ) : (
                        <>
                            <ErrorOutlined color="error" data-testid="500-transcript" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                                Error fetching transcripts
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>{error.message}</Typography>
                        </>
                    )}
                    <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
                        Go Back Home
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" disableGutters sx={containerSx}>
            {/* Title and metadata */}
            <Typography
                color="primary"
                variant="h5"
                component="h1"
                data-testid="stream-title"
                sx={{ mb: 2, wordBreak: "break-word" }}
            >
                {streamTitle}
            </Typography>
            {streamType === "Members" && (
                <Paper
                    elevation={4}
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        p: 1.5,
                        mb: 2,
                        border: "2px solid",
                        borderColor: "error.main",
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        color="error"
                        sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        <ErrorOutlined /> This is members content and should only be used for personal use, never
                        shared.
                    </Typography>
                </Paper>
            )}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 2,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                    textAlign: "left",
                }}
            >
                <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 3 }}
                    useFlexGap
                    sx={{ flexWrap: "wrap", alignItems: "center" }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }} data-testid="stream-streamer">
                            {streamer}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2" data-testid="stream-date">
                            {toLocalDate(date)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocalOffer fontSize="small" color="action" />
                        <Chip
                            label={streamType}
                            size="small"
                            data-testid="stream-type"
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
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 2 }}>
                    <Button
                        component={RouterLink}
                        to={getGraphPath(id)}
                        variant="contained"
                        size="small"
                        startIcon={<Timeline />}
                        data-testid="graph-stream-link"
                        sx={actionButtonSx}
                    >
                        Graph this stream
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNew />}
                        onClick={handleOpenStream}
                        data-testid="open-stream"
                        sx={actionButtonSx}
                    >
                        Open Stream
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={handleCopyTranscriptLink}
                        data-testid="copy-transcript-link"
                        sx={actionButtonSx}
                    >
                        Copy transcript link
                    </Button>
                </Stack>
            </Paper>

            {/* Filter */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    mb: 1,
                }}
            >
                <TextField
                    inputRef={searchInputRef}
                    label="Search Transcript"
                    variant="outlined"
                    size="small"
                    data-testid="transcript-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                            endAdornment: isFiltering ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        edge="end"
                                        onClick={handleClearFilter}
                                        aria-label="clear search"
                                        data-testid="clear-search-button"
                                    >
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                    sx={{ width: isMobile ? "100%" : "50%" }}
                />
                {isFiltering && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        aria-live="polite"
                        data-testid="transcript-match-count"
                        sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
                    >
                        {filteredTranscriptLines.length.toLocaleString()} of {transcriptLines.length.toLocaleString()}{" "}
                        lines
                    </Typography>
                )}
            </Box>
            <Divider sx={{ my: 1 }} />

            {/* Virtualized List */}
            {isFiltering && filteredTranscriptLines.length === 0 ? (
                <Alert severity="info" data-testid="transcript-no-match" sx={{ mt: 2, textAlign: "left" }}>
                    No lines match “{searchTerm}”
                </Alert>
            ) : (
                <Virtuoso
                    ref={virtuosoRef}
                    useWindowScroll
                    style={{
                        height:
                            streamType === "Members"
                                ? isMobile
                                    ? "calc(100svh - 120px)"
                                    : "calc(100vh - 250px)"
                                : isMobile
                                  ? "calc(100svh - 120px)"
                                  : "calc(100vh - 180px)",
                    }}
                    data={filteredTranscriptLines}
                    itemContent={(index, line) => (
                        <Line
                            key={line.id ? `line-${line.id}` : `line-idx-${index}`}
                            id={line.id}
                            start={line.start}
                            text={line.text}
                            searchTerm={searchTerm}
                            handleClick={handleLineClick}
                        />
                    )}
                />
            )}

            <LineActionsDialog
                open={lineDialogOpen}
                timestamp={lineAction.timestamp}
                text={lineAction.text}
                linePath={linePath}
                videoUrl={lineVideoUrl}
                onClose={closeLineDialog}
                onJump={handleJumpToLine}
            />

            <ExternalLinkDialog url={externalUrl} onClose={() => setExternalUrl("")} copyMessage="Video link copied" />

            <ScrollToTopFab />
        </Container>
    );
}
