import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    FormControl,
    InputLabel,
    Box,
    MenuItem,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Delete, CheckCircle, ErrorOutline } from "@mui/icons-material";
import { useAppStore } from "../store/store";
import { useState, useEffect } from "react";
import { verifyMembershipKey } from "../logic/api";
import { formatExpirationDate } from "../logic/timezone";

/**
 * A dialog for adjusting application settings like theme and density.
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function(boolean): void} props.setOpen - Callback to change the open state.
 */
const SettingsPopup = ({ open, setOpen }) => {
    const theme = useAppStore((state) => state.theme);
    const density = useAppStore((state) => state.density);
    const setTheme = useAppStore((state) => state.setTheme);
    const setDensity = useAppStore((state) => state.setDensity);
    const membershipKey = useAppStore((state) => state.membershipKey);
    const membershipInfo = useAppStore((state) => state.membershipInfo);
    const setMembershipKey = useAppStore((state) => state.setMembershipKey);
    const setMembershipInfo = useAppStore((state) => state.setMembershipInfo);

    const [localKey, setLocalKey] = useState(membershipKey);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLocalKey(membershipKey);
    }, [membershipKey]);

    const handleVerify = async () => {
        if (!localKey.trim()) return;
        setIsVerifying(true);
        setError("");
        try {
            const info = await verifyMembershipKey(localKey.trim());
            setMembershipKey(localKey.trim());
            setMembershipInfo(info);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = () => {
        setMembershipKey("");
        setMembershipInfo(null);
        setLocalKey("");
        setError("");
    };

    const handleClose = () => {
        setOpen(false);
    };

    const isExpired = membershipInfo ? new Date(membershipInfo.expiresAt) < new Date() : false;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <FormControl fullWidth variant="filled">
                        <InputLabel id="theme-select-label">Theme</InputLabel>
                        <Select
                            labelId="theme-select-label"
                            name="theme"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth variant="filled">
                        <InputLabel id="density-select-label">Density</InputLabel>
                        <Select
                            labelId="density-select-label"
                            name="density"
                            value={density}
                            onChange={(e) => setDensity(e.target.value)}
                        >
                            <MenuItem value="compact">Compact</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="comfortable">Comfortable</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
                    <Typography variant="h6">Membership</Typography>
                    {membershipInfo ? (
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: isExpired ? "error.main" : "primary.main",
                                borderRadius: 1,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                {isExpired ? <ErrorOutline color="error" /> : <CheckCircle color="success" />}
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    color={isExpired ? "error" : "inherit"}
                                >
                                    {isExpired ? "Expired Key" : "Verified"}
                                </Typography>
                            </Box>
                            <Typography variant="body2">
                                <b>Channel:</b> {membershipInfo.channel}
                            </Typography>
                            <Typography variant="body2" color={isExpired ? "error" : "inherit"}>
                                <b>{isExpired ? "Expired" : "Expires"}</b>:{" "}
                                {formatExpirationDate(membershipInfo.expiresAt)}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={handleDelete}
                                sx={{ mt: 2 }}
                                fullWidth
                            >
                                Delete Key
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <TextField
                                label="Membership Key"
                                variant="outlined"
                                fullWidth
                                type="text"
                                value={localKey}
                                onChange={(e) => setLocalKey(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleVerify();
                                    }
                                }}
                                error={!!error}
                                helperText={error}
                            />
                            <Button
                                variant="contained"
                                onClick={handleVerify}
                                disabled={isVerifying || !localKey.trim()}
                                fullWidth
                            >
                                {isVerifying ? <CircularProgress size={24} /> : "Verify Key"}
                            </Button>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsPopup;
