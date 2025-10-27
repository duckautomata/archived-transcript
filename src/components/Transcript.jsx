import { ErrorOutline, Info, Link } from "@mui/icons-material";
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
} from "@mui/material";
import { memo, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTranscriptById } from "../logic/api";
import styled from "@emotion/styled";
import { useAppStore } from "../store/store";
import TranscriptSkeleton from "./TranscriptSkeleton";
import { toLocalDate } from "../logic/timezone";

const TimestampTheme = styled("span")(({ theme }) => ({
    "&": {
        color: theme.palette.timestamp.main,
    },
}));

const Line = memo(({ id, start, text, handleClick }) => {
    const theme = useTheme();
    const density = useAppStore((state) => state.density);

    const iconColor = theme.palette.id.main;
    const iconSize = density === "comfortable" ? "medium" : "small";
    const iconSx = density === "compact" ? { padding: 0 } : {};

    return (
        <Typography
            color="secondary"
            aria-live="assertive"
            padding="1px"
            whiteSpace="pre-wrap"
            align="left"
            id={id}
            style={{
                background: "none",
                wordBreak: "break-word",
            }}
        >
            <Tooltip title="Open video at timestamp">
                <IconButton size={iconSize} sx={iconSx} onClick={() => handleClick(start)}>
                    <Link style={{ color: iconColor }} />
                </IconButton>
            </Tooltip>{" "}
            [<TimestampTheme theme={theme}>{start}</TimestampTheme>] {text}
        </Typography>
    );
});

Line.displayName = "Line";

export default function Transcript() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [date, setDate] = useState("");
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [streamer, setStreamer] = useState("");
    const [transcriptLines, setTranscriptLines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [navigationUrl, setNavigationUrl] = useState("");

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

            setNavigationUrl(url);
            setDialogOpen(true);
        },
        [streamType, id],
    );

    const handleDialogClose = () => {
        setDialogOpen(false);
        setNavigationUrl("");
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

    useEffect(() => {
        let isMounted = true;

        async function fetchTranscript() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTranscriptById(id);
                if (isMounted) {
                    setDate(data.date);
                    setStreamTitle(data.streamTitle);
                    setStreamType(data.streamType);
                    setStreamer(data.streamer);
                    setTranscriptLines(data.transcriptLines);
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

    return (
        <div className="transcript">
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
                            <Typography
                                color="primary"
                                variant="h5"
                                component="h5"
                                sx={{ mb: 2, wordBreak: "break-word" }}
                            >
                                {streamTitle}
                            </Typography>
                            <Typography>
                                {toLocalDate(date)} - {streamType} - {streamer}
                            </Typography>
                            {transcriptLines.map((line) => (
                                <Line
                                    key={`streamLogsLine-${line.id}`}
                                    id={line.id}
                                    start={line.start}
                                    text={line.text}
                                    handleClick={handleClick}
                                />
                            ))}
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
                    <Button onClick={handleDialogCopy}>Copy Instead</Button>
                    <Button onClick={handleDialogConfirm} autoFocus>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
