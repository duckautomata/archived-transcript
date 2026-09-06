import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from "@mui/material";
import { ContentCopy, OpenInNew } from "@mui/icons-material";
import { copyWithToast } from "../logic/clipboard";

/**
 * Confirmation dialog shown before leaving the site. Offers to copy the URL or open it in a new tab.
 * The dialog is open while `url` is non-empty.
 * @param {object} props
 * @param {string} props.url - External URL to open
 * @param {() => void} props.onClose - Called when the dialog should close (cancel, copy, open)
 * @param {string} [props.title]
 * @param {string} [props.copyMessage] - Toast shown after copying
 */
export default function ExternalLinkDialog({
    url,
    onClose,
    title = "Open external site?",
    copyMessage = "Link copied",
}) {
    const handleCopy = async () => {
        await copyWithToast(url, copyMessage);
        onClose();
    };

    return (
        <Dialog open={Boolean(url)} onClose={onClose} aria-labelledby="external-link-dialog-title">
            <DialogTitle id="external-link-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>You are about to open an external site in a new tab.</DialogContentText>
                <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all", color: "text.secondary" }}>
                    {url}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                <Button onClick={onClose} color="inherit" data-testid="external-link-cancel">
                    Cancel
                </Button>
                <Button onClick={handleCopy} startIcon={<ContentCopy />} data-testid="external-link-copy">
                    Copy Link
                </Button>
                <Button
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    variant="contained"
                    startIcon={<OpenInNew />}
                    autoFocus
                    data-testid="external-link-open"
                >
                    Open
                </Button>
            </DialogActions>
        </Dialog>
    );
}
