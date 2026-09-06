import { Button, CircularProgress, Stack, Tooltip } from "@mui/material";
import { RestartAlt, Share } from "@mui/icons-material";

/**
 * The [Submit] [Reset] [Share] button row shown under a query form. Must be rendered inside a <form>
 * so that pressing Enter in any field submits the query.
 * @param {object} props
 * @param {string} props.submitLabel - e.g. "Search"
 * @param {string} props.loadingLabel - e.g. "Searching..."
 * @param {boolean} props.isLoading - Disables the submit button and shows a spinner
 * @param {React.ReactNode} [props.submitIcon] - Icon shown in front of the submit label
 * @param {string} [props.submitTestId] - data-testid of the submit button
 * @param {() => void} props.onReset - Clears every field (and the URL)
 * @param {() => void} props.onShare - Copies the shareable URL for the current fields
 */
export default function QueryActions({
    submitLabel,
    loadingLabel,
    isLoading,
    submitIcon,
    submitTestId,
    onReset,
    onShare,
}) {
    const secondaryButtonSx = {
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: 600,
        flex: { xs: 1, sm: "0 0 auto" },
        whiteSpace: "nowrap",
    };

    return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
            <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                data-testid={submitTestId}
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : submitIcon}
                sx={{
                    flexGrow: 1,
                    py: 1.25,
                    borderRadius: "12px",
                    fontWeight: "bold",
                    boxShadow: "none",
                    "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
                }}
            >
                {isLoading ? loadingLabel : submitLabel}
            </Button>
            <Stack direction="row" spacing={1.5}>
                <Tooltip title="Clear every field">
                    <Button
                        type="button"
                        variant="outlined"
                        color="inherit"
                        onClick={onReset}
                        startIcon={<RestartAlt />}
                        data-testid="reset-query"
                        sx={secondaryButtonSx}
                    >
                        Reset
                    </Button>
                </Tooltip>
                <Tooltip title="Copy a link to this query">
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onShare}
                        startIcon={<Share />}
                        data-testid="share-query"
                        sx={secondaryButtonSx}
                    >
                        Share
                    </Button>
                </Tooltip>
            </Stack>
        </Stack>
    );
}
