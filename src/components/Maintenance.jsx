import { Engineering } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

/**
 * A page for displaying maintenance message.
 */
export default function Maintenance() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "50vh",
            }}
        >
            <Engineering color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                Archived Transcript is currently down for maintenance.
            </Typography>
            <Typography color="text.secondary">{window.maintenanceText1}</Typography>
            <Typography color="text.secondary">{window.maintenanceText2}</Typography>
        </Box>
    );
}
