import { useState } from "react";
import { Snackbar, Button, Alert, AlertTitle, CircularProgress } from "@mui/material";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import { useNavigate } from "react-router-dom";
import { useVersionCheck } from "../logic/useVersionCheck";

/**
 * Component to display a notification when a new version of the app is available.
 */
const UpdateAlert = () => {
    const { updateAvailable } = useVersionCheck();
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        // due to the GitHub 404 redirection logic, it turns any subpage into a query string, which turns on caching.
        // To bypass this, we navigate to the root page and then reload the page. Which does not cache the page.
        navigate("/", { replace: true });
        setTimeout(() => {
            window.location.reload(true);
        }, 100);
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
                        disabled={refreshing}
                        startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <SystemUpdateIcon />}
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
                        {refreshing ? "Updating..." : "Update"}
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
