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
} from "@mui/material";
import { Link } from "@mui/icons-material";
import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toLocalDate, timeToSeconds } from "../logic/timezone";
import { useAppStore } from "../store/store";
import { contextLimit } from "../config";

const SegmentTheme = styled("span")(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const TimestampTheme = styled("span")(({ theme }) => ({
    "&": {
        color: theme.palette.timestamp.main,
    },
}));

const ContextLine = memo(function ContextLine({ text, start, targetWord, margin, onActionClick }) {
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
});

export default memo(function ExpandableResult({ stream, targetWord }) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const { id, streamer, date, streamType, title, contexts } = stream;
    const lineCount = contexts.length;
    const limited = lineCount === contextLimit;
    const displayStyle = isMobile ? "block" : "flex";

    const [isOpen, setIsOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionContext, setActionContext] = useState({
        timestamp: "",
        lineText: "",
        internalJumpUrl: "",
        externalVideoUrl: "",
    });
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
                        display: displayStyle,
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
                            flexGrow: 1,
                            mr: 2,
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
                            mr: 2,
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
                    <Button variant="contained" size="small" onClick={handleTranscriptClick} sx={{ flexShrink: 0 }}>
                        View Full Transcript
                    </Button>
                    <span style={{ paddingRight: 10 }} />
                    <Button variant="contained" size="small" onClick={handleGraphClick} sx={{ flexShrink: 0 }}>
                        Graph This Stream
                    </Button>
                    {limited && (
                        <Typography>
                            Note: results may be limited. To see all results, click on &#34;View Full Transcript&#34;
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
        </Box>
    );
});
