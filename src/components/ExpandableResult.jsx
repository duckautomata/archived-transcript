// Will show start time, title, button to view transcript, expandable. Once expanded, it will show every line that has the searched word with some context zone.

import styled from "@emotion/styled";
import {
    Typography,
    Box,
    Button,
    useMediaQuery,
    useTheme,
    IconButton,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
} from "@mui/material";
import { Link, Description, Timeline, OpenInNew } from "@mui/icons-material";
import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toLocalDate, timeToSeconds } from "../logic/timezone";
import { useAppStore } from "../store/store";
import { contextLimit } from "../config";

/**
 * @typedef {import('../logic/api').TranscriptSearch} TranscriptSearch
 */

const SegmentTheme = styled("span")(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const TimestampTheme = styled("span")(({ theme }) => ({
    "&": {
        color: theme.palette.timestamp.main,
    },
}));

/**
 * A memoized component for displaying a single line of context.
 * @param {Object} props
 * @param {string} props.text - The text of the line.
 * @param {string} props.start - The timestamp of the start of the line.
 * @param {string} props.targetWord - The word to highlight.
 * @param {number} props.margin - The margin to apply to the line.
 * @param {function} props.onActionClick - The callback function to call when the line button is clicked.
 */
const ContextLine = memo(
    /**
     * A memoized component for displaying a single line of context.
     * @param {Object} props
     * @param {string} props.text - The text of the line.
     * @param {string} props.start - The timestamp of the start of the line.
     * @param {string} props.targetWord - The word to highlight.
     * @param {number} props.margin - The margin to apply to the line.
     * @param {function} props.onActionClick - The callback function to call when the line button is clicked.
     */
    function ContextLine({ text, start, targetWord, margin, onActionClick }) {
        const theme = useTheme();
        const density = useAppStore((state) => state.density);
        const regex = new RegExp(`(${targetWord})`, "gi");
        const parts = text.split(regex);
        const iconColor = theme.palette.id.main;
        const iconSize = density === "comfortable" ? "medium" : "small";
        const iconSx = density === "compact" ? { padding: 0 } : {};

        const handleActionTrigger = () => {
            onActionClick(start, text);
        };

        return (
            <Box sx={{ display: "flex", alignItems: "center", mt: margin, textAlign: "left" }}>
                <Tooltip title="Line Actions">
                    <IconButton size={iconSize} sx={iconSx} onClick={handleActionTrigger}>
                        <Link style={{ color: iconColor }} />
                    </IconButton>
                </Tooltip>{" "}
                <Typography component="p" sx={{ ml: 1, wordBreak: "break-word" }}>
                    [<TimestampTheme theme={theme}>{start}</TimestampTheme>]{" "}
                    <span>
                        {parts.map((part, index) =>
                            regex.test(part) ? (
                                <SegmentTheme key={index}>
                                    <u>{part}</u>
                                </SegmentTheme>
                            ) : (
                                <span key={index}>{part}</span>
                            ),
                        )}
                    </span>
                </Typography>
            </Box>
        );
    },
);

/**
 * A memoized component for displaying an expandable result of a transcript search for a specific stream.
 * @param {Object} props
 * @param {TranscriptSearch} props.stream - The result of a transcript search for a specific stream.
 * @param {string} props.targetWord - The word to highlight.
 */
export default memo(
    /**
     * A memoized component for displaying an expandable result of a transcript search for a specific stream.
     * @param {Object} props
     * @param {TranscriptSearch} props.stream - The result of a transcript search for a specific stream.
     * @param {string} props.targetWord - The word to highlight.
     */
    function ExpandableResult({ stream, targetWord }) {
        const navigate = useNavigate();
        const isMobile = useMediaQuery("(max-width:768px)");
        const { id, streamer, date, streamType, title, contexts } = stream;
        const lineCount = contexts.length;
        const limited = lineCount === contextLimit;

        const [isOpen, setIsOpen] = useState(false);
        const [dialogOpen, setDialogOpen] = useState(false);
        const [actionContext, setActionContext] = useState({
            timestamp: "",
            lineText: "",
            internalJumpUrl: "",
            externalVideoUrl: "",
        });
        const [externalConfirmOpen, setExternalConfirmOpen] = useState(false);
        const [confirmUrl, setConfirmUrl] = useState("");
        const density = useAppStore((state) => state.density);
        let marginBottom = 0.5;
        if (density === "standard") {
            marginBottom = 1.5;
        } else if (density === "comfortable") {
            marginBottom = 2.5;
        }

        const handleTranscriptClick = () => {
            navigate(`/transcript/${id}`);
        };

        const handleGraphClick = () => {
            navigate(`/graph/${id}`);
        };

        // --- Combined Action Handler ---
        const handleActionClick = useCallback(
            (timestamp, lineText) => {
                let externalUrl;
                let internalUrl;
                const parts = timestamp.split(":");

                // Calculate External URL
                if (streamType === "Twitch") {
                    const timeParam = `${parts[0]}h${parts[1]}m${parts[2]}s`;
                    externalUrl = `https://www.twitch.tv/videos/${id}?t=${timeParam}`;
                } else {
                    const seconds = timeToSeconds(timestamp);
                    externalUrl = `https://www.youtube.com/watch?v=${id}&t=${seconds}s`;
                }

                // Calculate Internal URL
                const encodedTime = timestamp.replace(/:/g, "-");
                internalUrl = `/transcript/${id}#T${encodedTime}`;

                // Set context for the dialog and open it
                setActionContext({
                    timestamp: timestamp,
                    lineText: lineText, // Store line text for context
                    internalJumpUrl: internalUrl,
                    externalVideoUrl: externalUrl,
                });
                setDialogOpen(true);
            },
            [streamType, id], // navigate is stable, no need to include
        );

        // --- Dialog Action Handlers ---
        const handleDialogClose = () => {
            setDialogOpen(false);
            // Reset context after closing (optional but good practice)
            setActionContext({
                timestamp: "",
                lineText: "",
                internalJumpUrl: "",
                externalVideoUrl: "",
            });
        };

        const handleOpenStreamClick = () => {
            let url;
            if (streamType === "Twitch") {
                url = `https://www.twitch.tv/videos/${id}`;
            } else {
                url = `https://www.youtube.com/watch?v=${id}`;
            }
            setConfirmUrl(url);
            setExternalConfirmOpen(true);
        };

        const handleExternalConfirmClose = () => {
            setExternalConfirmOpen(false);
        };

        const handleExternalConfirmProceed = () => {
            window.open(confirmUrl, "_blank").focus();
            setExternalConfirmOpen(false);
        };

        const handleDialogJump = () => {
            if (actionContext.internalJumpUrl) {
                navigate(actionContext.internalJumpUrl);
            }
            handleDialogClose();
        };

        const handleDialogCopy = () => {
            if (actionContext.externalVideoUrl) {
                navigator.clipboard.writeText(actionContext.externalVideoUrl);
            }
            handleDialogClose();
        };

        const handleDialogOpenExternal = () => {
            if (actionContext.externalVideoUrl) {
                window.open(actionContext.externalVideoUrl, "_blank").focus();
            }
            handleDialogClose();
        };
        // --- End Dialog Action Handlers ---

        let accordionBgColor = "#5e5e5eff"; // Default background
        let border = 1;
        if (streamType === "Video") {
            accordionBgColor = "#0f2380ff";
            border = 1;
        } else if (streamType === "Twitch") {
            accordionBgColor = "#6441a5";
            border = 1;
        } else if (streamType === "TwitchVod") {
            accordionBgColor = "#FF41a5";
            border = 1;
        } else if (streamType === "External") {
            accordionBgColor = "#af6c6cff";
            border = 1;
        } else if (streamType === "Members") {
            accordionBgColor = "#FFD700";
            border = 2;
        }

        const summaryStyle = {
            display: "block",
            cursor: "pointer",
            padding: "12px 16px",
        };

        const detailsContentStyle = {
            padding: "16px",
            borderTop: border ? `1px solid ${accordionBgColor}` : "none",
        };

        const handleToggle = (e) => {
            setIsOpen(e.currentTarget.open);
        };

        return (
            <Box
                component="details"
                onToggle={handleToggle}
                sx={{
                    mb: marginBottom,
                    borderRadius: 4,
                    border: border ? `${border}px solid ${accordionBgColor}` : "none",
                    overflow: "hidden",
                }}
            >
                <summary style={summaryStyle}>
                    <Box
                        sx={{
                            alignItems: "center",
                            width: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                flexShrink: 0,
                                mr: 2,
                                color: "text.secondary",
                            }}
                        >
                            {toLocalDate(date)}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                flexShrink: 0,
                                mr: 2,
                                color: "text.secondary",
                            }}
                        >
                            {streamer}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                flexShrink: 0,
                                mr: 2,
                                color: accordionBgColor,
                                fontWeight: "bold",
                            }}
                        >
                            {streamType}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                flexGrow: 1,
                                mr: 2,
                                mt: isMobile ? 1 : 0,
                                width: isMobile ? "100%" : "auto",
                                order: isMobile ? 1 : 0,
                                noWrap: true,
                                textOverflow: "ellipsis",
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                width: "70px",
                                flexShrink: 0,
                                mr: isMobile ? 0 : 2,
                                ml: isMobile ? "auto" : 0,
                                color: "text.secondary",
                                textAlign: "right",
                            }}
                        >
                            {lineCount} found
                        </Typography>
                    </Box>
                </summary>

                {/* This div is the content that expands. Only render if it is open*/}
                {isOpen && (
                    <div style={detailsContentStyle}>
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={2}
                            sx={{ mb: 2, justifyContent: "center" }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleTranscriptClick}
                                startIcon={<Description />}
                                sx={{ flexShrink: 0 }}
                            >
                                View Full Transcript
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleGraphClick}
                                startIcon={<Timeline />}
                                sx={{ flexShrink: 0 }}
                            >
                                Graph This Stream
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleOpenStreamClick}
                                startIcon={<OpenInNew />}
                                sx={{ flexShrink: 0 }}
                            >
                                Open This Stream
                            </Button>
                        </Stack>
                        {limited && (
                            <Typography>
                                Note: results may be limited. To see all results, click on &#34;View Full
                                Transcript&#34;
                            </Typography>
                        )}
                        {streamType === "Members" && (
                            <Typography
                                variant="h6"
                                color="error"
                                sx={{ mb: 2, mt: 2, fontWeight: "bold", p: 1, borderRadius: 1 }}
                            >
                                This is members content and should only be used for personal use, never shared.
                            </Typography>
                        )}
                        {contexts.map((searchContext, index) => (
                            <ContextLine
                                key={`${id}-${searchContext.startTime}-${index}`}
                                start={searchContext.startTime}
                                text={searchContext.line}
                                targetWord={targetWord}
                                margin={marginBottom}
                                onActionClick={handleActionClick}
                            />
                        ))}
                    </div>
                )}

                {/* Line Action Dialog */}
                <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="line-action-dialog-title">
                    <DialogTitle id="line-action-dialog-title">Line Action [{actionContext.timestamp}]</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2, fontStyle: "italic", wordBreak: "break-word" }}>
                            &#34;{actionContext.lineText}&#34;
                        </DialogContentText>
                        <DialogContentText>Choose an action for this line:</DialogContentText>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            p: 2,
                            gap: 2,
                            // Target direct children that are not style tags and override margin-left
                            "& > :not(style)": {
                                marginLeft: "0 !important", // Override the default MUI margin
                            },
                        }}
                    >
                        {/* Option 1: Jump to Line */}
                        <Button onClick={handleDialogJump} variant="outlined" fullWidth>
                            Jump to Line in Transcript
                        </Button>
                        {/* Option 2: Copy Link */}
                        <Button onClick={handleDialogCopy} variant="outlined" fullWidth>
                            Copy External Link
                        </Button>
                        {/* Option 3: Open Link */}
                        <Button onClick={handleDialogOpenExternal} variant="contained" fullWidth autoFocus>
                            Open External Link
                        </Button>
                        {/* Option 4: Cancel */}
                        <Button onClick={handleDialogClose} color="inherit" fullWidth sx={{ mt: 1 }}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* External Navigation Dialog */}
                <Dialog
                    open={externalConfirmOpen}
                    onClose={handleExternalConfirmClose}
                    aria-labelledby="external-nav-dialog-title"
                >
                    <DialogTitle id="external-nav-dialog-title">Confirm External Navigation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>You are about to be redirected to an external site.</DialogContentText>
                        <DialogContentText sx={{ mt: 2, wordBreak: "break-all" }}>URL: {confirmUrl}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleExternalConfirmClose}>Cancel</Button>
                        <Button onClick={handleExternalConfirmProceed} variant="contained" color="primary" autoFocus>
                            Proceed to Site
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    },
);
