// Will show start time, title, button to view transcript, expandable. Once expanded, it will show every line that has the searched word with some context zone.

import styled from "@emotion/styled";
import { Typography, Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toLocalDate } from "../logic/timezone";
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

const HighlightedText = memo(function HighlightedText({ text, start, targetWord, margin }) {
    const theme = useTheme();
    const regex = new RegExp(`(${targetWord})`, "gi");
    const parts = text.split(regex);

    return (
        <Typography component="p" sx={{ mt: margin, textAlign: "left" }}>
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
                    {contexts.map((searchContext) => (
                        <HighlightedText
                            key={searchContext.startTime + searchContext.line + targetWord}
                            start={searchContext.startTime}
                            text={searchContext.line}
                            targetWord={targetWord}
                            margin={marginBottom}
                        />
                    ))}
                </div>
            )}
        </Box>
    );
});
