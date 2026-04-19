import { useEffect, useState } from "react";
import { useAppStore } from "../store/store";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography,
    CircularProgress,
    Chip,
} from "@mui/material";
import { server } from "../config";

/* global __BUILD_TIME__ */

const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    if (timestamp === 0) return "Never";

    let date;
    if (typeof timestamp === "string") {
        date = new Date(timestamp);
    } else {
        date = new Date(timestamp < 100000000000 ? timestamp * 1000 : timestamp);
    }
    return date.toLocaleString();
};

export default function InfoPopup() {
    const infoOpen = useAppStore((state) => state.infoOpen);
    const setInfoOpen = useAppStore((state) => state.setInfoOpen);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (infoOpen) {
            setLoading(true);
            fetch(`${server}/status`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setData(data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [infoOpen]);

    const handleClose = () => {
        setInfoOpen(false);
    };

    const uiChipColor =
        import.meta.env.VITE_ENVIRONMENT === "prod"
            ? "success"
            : import.meta.env.VITE_ENVIRONMENT === "dev"
              ? "warning"
              : "default";
    const serverChipColor = data?.version === "dev" ? "warning" : "primary";

    return (
        <Dialog open={infoOpen} onClose={handleClose} aria-labelledby="info-dialog-title" maxWidth="md" fullWidth>
            <DialogTitle id="info-dialog-title">System Info</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                    {/* UI Info */}
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            UI
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <strong>Environment:</strong>
                                <Chip
                                    label={import.meta.env.VITE_ENVIRONMENT || "unknown"}
                                    size="small"
                                    color={uiChipColor}
                                    sx={{ textTransform: "capitalize", fontWeight: "bold" }}
                                />
                            </Typography>
                            <Typography variant="body1">
                                <strong>Build Time:</strong> {formatDate(__BUILD_TIME__)}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Server Info */}
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Server
                        </Typography>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : error ? (
                            <Typography color="error">Error connecting to server: {error}</Typography>
                        ) : data ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                                <Typography
                                    variant="body1"
                                    component="div"
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <strong>Version:</strong>
                                    <Chip
                                        label={data.version || "Unknown"}
                                        size="small"
                                        variant="outlined"
                                        color={serverChipColor}
                                        sx={{ fontWeight: "bold" }}
                                    />
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Build Time:</strong> {formatDate(data.buildTime)}
                                </Typography>
                            </Box>
                        ) : null}
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
