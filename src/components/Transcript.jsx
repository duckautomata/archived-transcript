import { Clear, ErrorOutline, Info, Link, Search } from "@mui/icons-material";
import {
    Typography,
    IconButton,
    useTheme,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Box,
    TextField,
    InputAdornment,
    useMediaQuery,
} from "@mui/material";
import { memo, useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getTranscriptById } from "../logic/api";
import styled from "@emotion/styled";
import { useAppStore } from "../store/store";
import TranscriptSkeleton from "./TranscriptSkeleton";
import { toLocalDate } from "../logic/timezone";
import { Virtuoso } from "react-virtuoso";

const TimestampTheme = styled("span")(({ theme }) => ({
    "&": {
        color: theme.palette.timestamp.main,
    },
}));

const Line = memo(function Line({ id, start, text, handleClick }) {
    const theme = useTheme();
    const density = useAppStore((state) => state.density);

    const iconColor = theme.palette.id.main;
    const iconSize = density === "comfortable" ? "medium" : "small";
    const iconSx = density === "compact" ? { padding: 0 } : {};

    return (
        <Box
            id={id}
            sx={{
                padding: "1px 0",
                "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
        >
            <Typography
                color="secondary"
                aria-live="assertive"
                whiteSpace="pre-wrap"
                align="left"
                style={{ wordBreak: "break-word" }}
            >
                <Tooltip title="Open video at timestamp">
                    <IconButton
                        size={iconSize}
                        sx={{ ...iconSx, verticalAlign: "middle" }}
                        onClick={() => handleClick(start)}
                    >
                        <Link style={{ color: iconColor }} />
                    </IconButton>
                </Tooltip>{" "}
                [<TimestampTheme theme={theme}>{start}</TimestampTheme>] {text}
            </Typography>
        </Box>
    );
});

export default function Transcript() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const virtuosoRef = useRef(null);
    const isMobile = useMediaQuery("(max-width:768px)");

    const [date, setDate] = useState("");
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [streamer, setStreamer] = useState("");
    const [transcriptLines, setTranscriptLines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [navigationUrl, setNavigationUrl] = useState("");
    const [internalUrl, setInternalUrl] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTranscriptLines = transcriptLines.filter((line) => {
        return line.text.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleClick = useCallback(
        (timestamp) => {
            let url;
            const parts = timestamp.split(":"); // Assuming "HH:MM:SS"

            if (streamType === "Twitch") {
                const timeParam = `${parts[0]}h${parts[1]}m${parts[2]}s`;
                url = `https://www.twitch.tv/videos/${id}?t=${timeParam}`;
            } else {
                // Default to YouTube
                const seconds = +parts[0] * 3600 + +parts[1] * 60 + +parts[2];
                url = `https://www.youtube.com/watch?v=${id}&t=${seconds}s`;
            }

            const encodedTime = timestamp.replace(/:/g, "-");
            setInternalUrl(`/transcript/${id}#T${encodedTime}`);
            setNavigationUrl(url);
            setDialogOpen(true);
        },
        [streamType, id],
    );

    const handleDialogClose = () => {
        setDialogOpen(false);
        setNavigationUrl("");
        setInternalUrl("");
    };

    const handleDialogJumpTo = () => {
        setSearchTerm("");
        navigate(internalUrl);
        handleDialogClose();
    };

    const handleDialogCopy = () => {
        if (navigationUrl) {
            navigator.clipboard.writeText(navigationUrl);
        }
        handleDialogClose();
    };

    const handleDialogConfirm = () => {
        if (navigationUrl) {
            window.open(navigationUrl, "_blank").focus();
        }
        handleDialogClose();
    };

    // Fetch transcript at page load
    useEffect(() => {
        let isMounted = true;

        async function fetchTranscript() {
            setIsLoading(true);
            setError(null);
            setTranscriptLines([]);

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

    // Jump to line if present in hash
    useEffect(() => {
        if (isLoading || transcriptLines.length === 0 || !virtuosoRef.current || !location.hash) {
            return;
        }

        if (!location.hash.startsWith("#T")) {
            return;
        }
        const encodedTime = location.hash.substring(2);
        const targetTime = encodedTime.replace(/-/g, ":");

        if (!targetTime) {
            return;
        }

        const targetIndex = transcriptLines.findIndex((line) => line.start === targetTime);
        const targetLineId = transcriptLines[targetIndex]?.id;

        if (targetIndex === -1 || !targetLineId) {
            return;
        }

        // Wait for all divs to be rendered, then scroll into view
        setTimeout(() => {
            if (virtuosoRef.current) {
                virtuosoRef.current.scrollToIndex({
                    index: targetIndex,
                    align: "start",
                });

                // Wait for it to scroll into view, then add highlight
                setTimeout(() => {
                    const element = document.getElementById(targetLineId);
                    if (!element) {
                        // Rendering is taking too long. So we skip the highlight
                        return;
                    }

                    element.classList.add("highlight");

                    // remove highlight after 2 seconds
                    setTimeout(() => {
                        if (document.getElementById(targetLineId)) {
                            element.classList.remove("highlight");
                        }
                    }, 2000);
                }, 150);
            }
        }, 100);
    }, [isLoading, transcriptLines, location.hash]);

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading ? (
                <TranscriptSkeleton />
            ) : (
                <>
                    {error ? (
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
                                    <Info color="primary" sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                                        404 Not Found
                                    </Typography>
                                    <Typography color="text.secondary">{error.message}</Typography>
                                </>
                            ) : (
                                <>
                                    <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                                        Error fetching transcripts
                                    </Typography>
                                    <Typography color="text.secondary">{error.message}</Typography>
                                </>
                            )}
                            <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>
                                Go Back Home
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {/* Title and metadata */}
                            <Typography
                                color="primary"
                                variant="h5"
                                component="h5"
                                sx={{ mb: 2, wordBreak: "break-word" }}
                            >
                                {streamTitle}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                {toLocalDate(date)} - {streamType} - {streamer}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <TextField
                                    label="Search Transcript"
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    sx={{ width: isMobile ? "100%" : "50%" }}
                                />
                                {searchTerm && ( // Conditionally render clear button
                                    <IconButton
                                        onClick={() => {
                                            setSearchTerm("");
                                        }}
                                        aria-label="clear search"
                                    >
                                        <Clear />
                                    </IconButton>
                                )}
                            </Box>
                            <hr />

                            {/* Virtualized List */}
                            <Virtuoso
                                ref={virtuosoRef}
                                style={{ height: "calc(100vh - 180px)" }}
                                data={filteredTranscriptLines}
                                itemContent={(index, line) => (
                                    <Line
                                        key={line.id ? `line-${line.id}` : `line-idx-${index}`}
                                        id={line.id}
                                        start={line.start}
                                        text={line.text}
                                        handleClick={handleClick}
                                    />
                                )}
                            />
                        </>
                    )}
                </>
            )}

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Confirm External Navigation</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You are about to open an external site in a new tab. Do you want to continue?
                    </DialogContentText>
                    <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all", color: "text.secondary" }}>
                        {navigationUrl}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleDialogJumpTo}>Jump to line</Button>
                    <Button onClick={handleDialogCopy}>Copy Instead</Button>
                    <Button onClick={handleDialogConfirm} autoFocus>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
