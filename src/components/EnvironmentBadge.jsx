import { Box, Typography, Chip, Tooltip, Fade } from "@mui/material";
import { LaptopMac, Construction, Science } from "@mui/icons-material";
import { useAppStore } from "../store/store";

/**
 * A premium floating badge that indicates the current environment (local, dev, etc.)
 * Provides a clean UI/UX differentiation while remaining unobtrusive.
 */
export default function EnvironmentBadge() {
    const setInfoOpen = useAppStore((state) => state.setInfoOpen);
    const environment = import.meta.env.VITE_ENVIRONMENT;

    if (!environment || environment === "prod") {
        return null;
    }

    const config = {
        local: {
            label: "Local",
            color: "#9c27b0", // Violet/Purple
            icon: <LaptopMac sx={{ fontSize: 16 }} />,
        },
        dev: {
            label: "Development",
            color: "#ed6c02", // Orange
            icon: <Construction sx={{ fontSize: 16 }} />,
        },
        staging: {
            label: "Staging",
            color: "#0288d1", // Cyan/Blue
            icon: <Science sx={{ fontSize: 16 }} />,
        },
    };

    const envConfig = config[environment] || {
        label: environment.toUpperCase(),
        color: "#757575",
        icon: <Construction sx={{ fontSize: 16 }} />,
    };

    return (
        <Fade in={true} timeout={1000}>
            <Box
                sx={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    zIndex: 2000,
                    pointerEvents: "auto",
                }}
            >
                <Tooltip title="View System Info" placement="left">
                    <Chip
                        icon={envConfig.icon}
                        label={envConfig.label}
                        onClick={() => setInfoOpen(true)}
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                    ? `rgba(${parseInt(envConfig.color.slice(1, 3), 16)}, ${parseInt(envConfig.color.slice(3, 5), 16)}, ${parseInt(envConfig.color.slice(5, 7), 16)}, 0.15)`
                                    : `rgba(${parseInt(envConfig.color.slice(1, 3), 16)}, ${parseInt(envConfig.color.slice(3, 5), 16)}, ${parseInt(envConfig.color.slice(5, 7), 16)}, 0.1)`,
                            color: envConfig.color,
                            fontWeight: "bold",
                            border: `1px solid ${envConfig.color}40`,
                            backdropFilter: "blur(8px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            pl: 0.5,
                            "&:hover": {
                                backgroundColor: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? `rgba(${parseInt(envConfig.color.slice(1, 3), 16)}, ${parseInt(envConfig.color.slice(3, 5), 16)}, ${parseInt(envConfig.color.slice(5, 7), 16)}, 0.3)`
                                        : `rgba(${parseInt(envConfig.color.slice(1, 3), 16)}, ${parseInt(envConfig.color.slice(3, 5), 16)}, ${parseInt(envConfig.color.slice(5, 7), 16)}, 0.2)`,
                                transform: "translateY(-2px)",
                                boxShadow: `0 4px 12px ${envConfig.color}40`,
                                border: `1px solid ${envConfig.color}80`,
                            },
                            "& .MuiChip-icon": {
                                color: "inherit",
                            },
                        }}
                    />
                </Tooltip>
            </Box>
        </Fade>
    );
}
