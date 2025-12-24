import { Snackbar, Button, Alert, AlertTitle } from "@mui/material";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import { useVersionCheck } from "../logic/useVersionCheck";

/**
 * Component to display a notification when a new version of the app is available.
 */
const UpdateAlert = () => {
    const { updateAvailable } = useVersionCheck();

    const handleRefresh = () => {
        window.location.reload(true);
    };

    return (
        <Snackbar
            open={updateAvailable}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{
                width: "90%",
                maxWidth: 500,
                top: { xs: "12px !important", sm: "24px !important" },
                left: "50% !important",
                transform: "translateX(-50%) !important",
            }}
        >
            <Alert
                severity="info"
                variant="filled"
                icon={false}
                sx={{
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: "#17786E",
                    backdropFilter: "blur(8px)",
                    color: "#FFFFFF",
                    fontWeight: 500,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                action={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<SystemUpdateIcon />}
                        onClick={handleRefresh}
                        sx={{
                            backgroundColor: "#FFFFFF",
                            color: "black",
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: "bold",
                            px: 2,
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                            },
                        }}
                    >
                        Update
                    </Button>
                }
            >
                <AlertTitle>Update Available</AlertTitle>
                Refresh the page or click the update button to update the website.
            </Alert>
        </Snackbar>
    );
};

export default UpdateAlert;
