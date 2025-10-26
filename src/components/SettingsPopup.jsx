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
} from "@mui/material";
import { useAppStore } from "../store/store";

const SettingsPopup = ({ open, setOpen }) => {
    const theme = useAppStore((state) => state.theme);
    const density = useAppStore((state) => state.density);
    const setTheme = useAppStore((state) => state.setTheme);
    const setDensity = useAppStore((state) => state.setDensity);

    const handleClose = () => {
        setOpen(false);
    };

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
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsPopup;
