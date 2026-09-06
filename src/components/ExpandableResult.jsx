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
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Chip,
    Divider,
    Link,
    alpha,
} from "@mui/material";
import { Link as LinkIcon, Description, Timeline, OpenInNew, ExpandMore } from "@mui/icons-material";
import { memo, useState, useCallback, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { toLocalDate } from "../logic/timezone";
import { useAppStore } from "../store/store";
import { contextLimit } from "../config";
import { getGraphPath, getTranscriptPath, getVideoUrl } from "../logic/videoLinks";
import ExternalLinkDialog from "./ExternalLinkDialog";
import LineActionsDialog from "./LineActionsDialog";

/**
 * @typedef {import('../logic/api').TranscriptSearch} TranscriptSearch
 */

const SegmentTheme = styled("span")(({ theme }) => ({
    color: theme.palette.primary.main,
}));

/**
 * Escape a string so it can be used literally inside a RegExp.
 * @param {string} value
 * @returns {string}
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A memoized component for displaying a single line of context.
 * @param {Object} props
 * @param {string} props.text - The text of the line.
 * @param {string} props.start - The timestamp of the start of the line.
 * @param {string} props.linePath - In-app path of the line in the full transcript ("/transcript/<id>#T..").
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
     * @param {string} props.linePath - In-app path of the line in the full transcript ("/transcript/<id>#T..").
     * @param {string} props.targetWord - The word to highlight.
     * @param {number} props.margin - The margin to apply to the line.
     * @param {function} props.onActionClick - The callback function to call when the line button is clicked.
     */
    function ContextLine({ text, start, linePath, targetWord, margin, onActionClick }) {
        const theme = useTheme();
        const density = useAppStore((state) => state.density);

        // Split the line around every (case-insensitive) occurrence of the target word. Because the pattern
        // is wrapped in a capture group, the matches land on the odd indexes of the resulting array.
        // When there is nothing to highlight we skip the split entirely and render the plain text.
        const parts = useMemo(() => {
            if (!targetWord || !targetWord.trim()) return null;
            return text.split(new RegExp(`(${escapeRegExp(targetWord)})`, "gi"));
        }, [text, targetWord]);

        const iconColor = theme.palette.id.main;
        const iconSize = density === "comfortable" ? "medium" : "small";
        const iconSx = density === "compact" ? { padding: 0 } : {};

        const handleActionTrigger = () => {
            onActionClick(start, text);
        };

        return (
            <Box sx={{ display: "flex", alignItems: "center", mt: margin, textAlign: "left" }}>
                <Tooltip title="Line actions">
                    <IconButton size={iconSize} sx={iconSx} onClick={handleActionTrigger} aria-label="Line actions">
                        <LinkIcon style={{ color: iconColor }} />
                    </IconButton>
                </Tooltip>{" "}
                <Typography component="p" sx={{ ml: 1, wordBreak: "break-word" }}>
                    <Link
                        component={RouterLink}
                        to={linePath}
                        underline="hover"
                        title="Open this line in the full transcript"
                        data-testid="context-timestamp"
                        sx={{ color: theme.palette.timestamp.main, fontVariantNumeric: "tabular-nums" }}
                    >
                        [{start}]
                    </Link>{" "}
                    <span>
                        {parts === null
                            ? text
                            : parts.map((part, index) =>
                                  index % 2 === 1 ? (
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

const emptyActionContext = {
    timestamp: "",
    lineText: "",
};

const actionButtonSx = {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: "bold",
};

/**
 * A memoized component for displaying an expandable result of a transcript search for a specific stream.
 * @param {Object} props
 * @param {TranscriptSearch} props.stream - The result of a transcript search for a specific stream.
 * @param {string} props.targetWord - The word to highlight.
 * @param {boolean} props.isExpanded - Whether the accordion is currently expanded.
 * @param {(isExpanded: boolean) => void} props.onToggle - Called when the accordion is expanded / collapsed.
 */
export default memo(
    /**
     * A memoized component for displaying an expandable result of a transcript search for a specific stream.
     * @param {Object} props
     * @param {TranscriptSearch} props.stream - The result of a transcript search for a specific stream.
     * @param {string} props.targetWord - The word to highlight.
     * @param {boolean} props.isExpanded - Whether the accordion is currently expanded.
     * @param {(isExpanded: boolean) => void} props.onToggle - Called when the accordion is expanded / collapsed.
     */
    function ExpandableResult({ stream, targetWord, isExpanded, onToggle }) {
        const isMobile = useMediaQuery("(max-width:768px)");
        const { id, streamer, date, streamType, title, contexts } = stream;
        const lineCount = contexts.length;
        const limited = lineCount === contextLimit;
        const matchLabel = `${lineCount} ${lineCount === 1 ? "match" : "matches"}`;

        const [dialogOpen, setDialogOpen] = useState(false);
        const [actionContext, setActionContext] = useState(emptyActionContext);
        const [externalUrl, setExternalUrl] = useState("");
        const density = useAppStore((state) => state.density);
        let marginBottom = 0.5;
        if (density === "standard") {
            marginBottom = 1.5;
        } else if (density === "comfortable") {
            marginBottom = 2.5;
        }

        // --- Line Action Handlers ---
        const handleActionClick = useCallback((timestamp, lineText) => {
            setActionContext({ timestamp, lineText });
            setDialogOpen(true);
        }, []);

        // The context is kept until the next open so the dialog does not go blank while it fades out.
        const handleDialogClose = () => {
            setDialogOpen(false);
        };
        // --- End Line Action Handlers ---

        const handleOpenStreamClick = () => {
            setExternalUrl(getVideoUrl(id, streamType));
        };

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
                                {matchLabel}
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
                                        component={RouterLink}
                                        to={getTranscriptPath(id)}
                                        variant="contained"
                                        size="small"
                                        startIcon={<Description />}
                                        data-testid="full-transcript-link"
                                        sx={{
                                            ...actionButtonSx,
                                            boxShadow: "none",
                                            "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                                        }}
                                    >
                                        Full Transcript
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to={getGraphPath(id)}
                                        variant="contained"
                                        size="small"
                                        color="secondary"
                                        startIcon={<Timeline />}
                                        data-testid="graph-view-link"
                                        sx={{
                                            ...actionButtonSx,
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
                                        data-testid="open-stream"
                                        sx={actionButtonSx}
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
                                            linePath={getTranscriptPath(id, searchContext.startTime)}
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

                {/* Line Action Dialog (shared with the transcript page) */}
                <LineActionsDialog
                    open={dialogOpen}
                    timestamp={actionContext.timestamp}
                    text={actionContext.lineText}
                    linePath={getTranscriptPath(id, actionContext.timestamp)}
                    videoUrl={actionContext.timestamp ? getVideoUrl(id, streamType, actionContext.timestamp) : ""}
                    onClose={handleDialogClose}
                />

                {/* External Navigation Dialog (Open Stream) */}
                <ExternalLinkDialog
                    url={externalUrl}
                    onClose={() => setExternalUrl("")}
                    copyMessage="Video link copied"
                />
            </Box>
        );
    },
);
