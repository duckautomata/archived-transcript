// Landing page. Will be similar to live-transcript home, but have a button to search and a button to graph. As well as a button to go back to live-transcript
import { Assessment, ManageSearch } from "@mui/icons-material";
import { Typography, Box, useMediaQuery, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4, gap: 2 }}>
            {isMobile ? (
                <Typography color="primary" variant="h4" component="h4" gutterBottom>
                    Archived Transcripts
                </Typography>
            ) : (
                <Typography color="primary" variant="h2" component="h2" gutterBottom>
                    Archived Transcripts
                </Typography>
            )}
            <Grid container spacing={6} sx={{ my: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        fullWidth
                        component="label"
                        role={undefined}
                        variant="outlined"
                        tabIndex={-1}
                        startIcon={<ManageSearch />}
                        onClick={() => navigate("/search")}
                        sx={{ height: 100, minWidth: isMobile ? "auto" : 150 }}
                    >
                        Search
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        fullWidth
                        component="label"
                        role={undefined}
                        variant="outlined"
                        tabIndex={-1}
                        startIcon={<Assessment />}
                        onClick={() => navigate("/graph")}
                        sx={{ height: 100, minWidth: isMobile ? "auto" : 150 }}
                    >
                        Graph
                    </Button>
                </Grid>
            </Grid>

            <Typography paddingTop={isMobile ? 3 : 10}>
                Looking for the transcript of an active stream instead?
            </Typography>
            <Button href="/live-transcript" variant="outlined">
                Go to Live-Transcript
            </Button>
        </Box>
    );
}
