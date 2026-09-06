import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { ArrowForward, ContentCopy, Link as LinkIcon, OpenInNew } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { copyWithToast } from "../logic/clipboard";
import { toAbsoluteUrl } from "../logic/videoLinks";

/**
 * Actions for one transcript line: jump to it, copy a link to it, copy / open the video at its timestamp.
 * Shared by the transcript view and the search result context lines so both behave the same.
 * "Jump to line" is a real link, so it can be opened in a new tab.
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.timestamp - "hh:mm:ss"
 * @param {string} props.text - The line text, shown for context
 * @param {string} props.linePath - In-app path of the line ("/transcript/<id>#T00-12-34")
 * @param {string} props.videoUrl - External video URL at the timestamp
 * @param {() => void} props.onClose
 * @param {() => void} [props.onJump] - Extra work right before jumping (e.g. clearing a filter)
 */
export default function LineActionsDialog({ open, timestamp, text, linePath, videoUrl, onClose, onJump }) {
    const handleJump = () => {
        onJump?.();
        onClose();
    };

    const handleCopyLineLink = () => {
        copyWithToast(toAbsoluteUrl(linePath), "Line link copied");
        onClose();
    };

    const handleCopyVideoLink = () => {
        copyWithToast(videoUrl, "Video link copied");
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="line-actions-dialog-title" fullWidth maxWidth="xs">
            <DialogTitle id="line-actions-dialog-title">Line actions [{timestamp}]</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontStyle: "italic", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                    “{text}”
                </DialogContentText>
            </DialogContent>
            <DialogActions
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    pt: 0,
                    gap: 1.5,
                    // Override the default margin MUI puts between dialog actions
                    "& > :not(style)": {
                        marginLeft: "0 !important",
                    },
                }}
            >
                <Button
                    component={RouterLink}
                    to={linePath}
                    onClick={handleJump}
                    variant="outlined"
                    fullWidth
                    startIcon={<ArrowForward />}
                    data-testid="jump-to-line"
                >
                    Jump to line
                </Button>
                <Button
                    onClick={handleCopyLineLink}
                    variant="outlined"
                    fullWidth
                    startIcon={<LinkIcon />}
                    data-testid="copy-line-link"
                >
                    Copy line link
                </Button>
                <Button
                    onClick={handleCopyVideoLink}
                    variant="outlined"
                    fullWidth
                    startIcon={<ContentCopy />}
                    data-testid="copy-video-link"
                >
                    Copy video link
                </Button>
                <Button
                    component="a"
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                    startIcon={<OpenInNew />}
                    data-testid="open-video"
                >
                    Open video
                </Button>
                <Button onClick={onClose} color="inherit" fullWidth data-testid="line-actions-cancel">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
