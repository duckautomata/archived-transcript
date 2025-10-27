// Landing page. Will be similar to live-transcript home, but have a button to search and a button to graph. As well as a button to go back to live-transcript
import { Assessment, ManageSearch } from "@mui/icons-material";
import { Typography, Box, useMediaQuery, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:599px)");
    const [transcriptId, setTranscriptId] = useState("");
    const [graphId, setGraphId] = useState("");

    const handleViewTranscript = () => {
        if (transcriptId.trim()) {
            navigate(`/transcript/${transcriptId.trim()}`);
        }
    };

    const handleViewGraph = () => {
        if (graphId.trim()) {
            navigate(`/graph/${graphId.trim()}`);
        }
    };

    const handleTranscriptKeyDown = (e) => {
        if (e.key === "Enter") {
            handleViewTranscript();
        }
    };

    const handleGraphKeyDown = (e) => {
        if (e.key === "Enter") {
            handleViewGraph();
        }
    };

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

            {/* --- Inputs Section --- */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "100%",
                    maxWidth: 500,
                    mt: 2,
                }}
            >
                {/* 1. View Transcript by ID */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: 1,
                    }}
                >
                    <TextField
                        fullWidth
                        label="View Transcript by ID"
                        variant="outlined"
                        value={transcriptId}
                        onChange={(e) => setTranscriptId(e.target.value)}
                        onKeyDown={handleTranscriptKeyDown}
                    />
                    <Button
                        variant="contained"
                        onClick={handleViewTranscript}
                        disabled={!transcriptId.trim()}
                        fullWidth={isMobile}
                        sx={{ minWidth: isMobile ? "auto" : "80px" }}
                    >
                        View
                    </Button>
                </Box>

                {/* 2. Graph Stream by ID */}
                <Box
                    sx={{
                        display: "flex",

                        flexDirection: isMobile ? "column" : "row",
                        gap: 1,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Graph Stream by ID"
                        variant="outlined"
                        value={graphId}
                        onChange={(e) => setGraphId(e.target.value)}
                        onKeyDown={handleGraphKeyDown}
                    />
                    <Button
                        variant="contained"
                        onClick={handleViewGraph}
                        disabled={!graphId.trim()}
                        fullWidth={isMobile}
                        sx={{ minWidth: isMobile ? "auto" : "80px" }}
                    >
                        Graph
                    </Button>
                </Box>
            </Box>
            {/* --- End Inputs Section --- */}

            <Typography paddingTop={isMobile ? 3 : 10}>
                Looking for the transcript of an active stream instead?
            </Typography>
            <Button href="/live-transcript" variant="outlined">
                Go to Live-Transcript
            </Button>
        </Box>
    );
}
