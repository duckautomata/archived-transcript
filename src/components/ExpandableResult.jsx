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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Chip,
    Divider,
    alpha,
} from "@mui/material";
import { Link, Description, Timeline, OpenInNew, ExpandMore } from "@mui/icons-material";
import { memo, useState, useCallback, useMemo } from "react";
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

        const { parts, regex } = useMemo(() => {
            const r = new RegExp(`(${targetWord})`, "gi");
            return { parts: text.split(r), regex: r };
        }, [text, targetWord]);

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
    function ExpandableResult({ stream, targetWord, isExpanded, onToggle }) {
        const navigate = useNavigate();
        const isMobile = useMediaQuery("(max-width:768px)");
        const { id, streamer, date, streamType, title, contexts } = stream;
        const lineCount = contexts.length;
        const limited = lineCount === contextLimit;

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

        const getStreamColor = (type) => {
            switch (type) {
                case "Video":
                    return "#3b82f6"; // Blue
                case "Twitch":
                    return "#9146ff"; // Twitch Purple
                case "TwitchVod":
                    return "#ec4899"; // Pink
                case "External":
                    return "#ef4444"; // Red
                case "Members":
                    return "#eab308"; // Gold
                default:
                    return "#6b7280"; // Gray
            }
        };

        const streamColor = getStreamColor(streamType);

        const handleAccordionChange = (_event, isExpandedNow) => {
            onToggle(isExpandedNow);
        };

        return (
            <Box sx={{ mb: marginBottom }}>
                <Accordion
                    expanded={isExpanded}
                    onChange={handleAccordionChange}
                    elevation={0}
                    disableGutters
                    data-testid={isExpanded ? `expanded-result-${stream.id}` : `expandable-result-${stream.id}`}
                    slotProps={{ transition: { unmountOnExit: true } }}
                    sx={{
                        borderRadius: "12px !important",
                        border: "1px solid",
                        borderColor: isExpanded ? streamColor : "divider",
                        transition: "all 0.2s ease-in-out",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                        "&:hover": {
                            borderColor: streamColor,
                            boxShadow: `0 4px 12px ${alpha(streamColor, 0.1)}`,
                        },
                        boxShadow: isExpanded ? `0 8px 24px ${alpha(streamColor, 0.15)}` : "none",
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        data-testid="expand-more"
                        sx={{
                            px: 2,
                            py: 1,
                            backgroundColor: isExpanded ? alpha(streamColor, 0.04) : "transparent",
                            "& .MuiAccordionSummary-content": {
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                overflow: "hidden",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                overflow: "hidden",
                                flexWrap: isMobile ? "wrap" : "nowrap",
                                gap: isMobile ? 1 : 2,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        fontWeight: 500,
                                        width: isMobile ? "auto" : "90px",
                                    }}
                                >
                                    {toLocalDate(date)}
                                </Typography>
                                <Chip
                                    label={streamType}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(streamColor, 0.1),
                                        color: streamColor,
                                        fontWeight: "bold",
                                        fontSize: "0.7rem",
                                        height: 20,
                                        borderRadius: "6px",
                                        border: `1px solid ${alpha(streamColor, 0.2)}`,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: "text.primary",
                                    flexShrink: 0,
                                    maxWidth: isMobile ? "100%" : "120px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {streamer}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    flexGrow: 1,
                                    color: "text.secondary",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    transition: "color 0.2s",
                                    "&:hover": { color: "text.primary" },
                                }}
                            >
                                {title}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    flexShrink: 0,
                                    backgroundColor: "action.hover",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: "4px",
                                    color: "text.secondary",
                                    fontWeight: "bold",
                                    ml: isMobile ? "auto" : 0,
                                }}
                            >
                                {lineCount} matches
                            </Typography>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 3, pb: 4, pt: 2 }}>
                        {isExpanded && (
                            <>
                                <Stack
                                    direction={isMobile ? "column" : "row"}
                                    spacing={2}
                                    sx={{ mb: 3, justifyContent: "flex-start" }}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleTranscriptClick}
                                        startIcon={<Description />}
                                        sx={{
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            boxShadow: "none",
                                            "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                                        }}
                                    >
                                        Full Transcript
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="secondary"
                                        onClick={handleGraphClick}
                                        startIcon={<Timeline />}
                                        sx={{
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            boxShadow: "none",
                                            "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                                        }}
                                    >
                                        Graph View
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleOpenStreamClick}
                                        startIcon={<OpenInNew />}
                                        sx={{
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Open Stream
                                    </Button>
                                </Stack>

                                {limited && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            mb: 2,
                                            backgroundColor: alpha("#f59e0b", 0.05),
                                            borderColor: alpha("#f59e0b", 0.2),
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="warning.main"
                                            sx={{ display: "block", fontWeight: 500 }}
                                        >
                                            Note: Results are limited. View Full Transcript to see all matches.
                                        </Typography>
                                    </Paper>
                                )}

                                {streamType === "Members" && (
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

                                <Divider sx={{ mb: 2, opacity: 0.6 }} />

                                <Box sx={{ "& > div:not(:last-child)": { mb: 1 } }}>
                                    {contexts.map((searchContext, index) => (
                                        <ContextLine
                                            key={`${id}-${searchContext.startTime}-${index}`}
                                            start={searchContext.startTime}
                                            text={searchContext.line}
                                            targetWord={targetWord}
                                            margin={0}
                                            onActionClick={handleActionClick}
                                        />
                                    ))}
                                </Box>
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>

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
