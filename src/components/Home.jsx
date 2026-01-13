import { Assessment, ManageSearch } from "@mui/icons-material";
import {
    Typography,
    Box,
    useMediaQuery,
    Button,
    Grid,
    TextField,
    Container,
    Card,
    CardActionArea,
    CardContent,
    Fade,
    Stack,
} from "@mui/material";
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
        <Container
            maxWidth="lg"
            sx={{
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
            }}
        >
            <Box sx={{ mb: 6, textAlign: "center" }}>
                <Typography
                    variant={isMobile ? "h3" : "h2"}
                    component="h1"
                    color="primary"
                    fontWeight="bold"
                    sx={{
                        background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.alt})`,
                        backgroundClip: "text",
                        textFillColor: "transparent",
                        mb: 2,
                    }}
                >
                    Archived Transcripts
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                    Search past streams or view specific transcripts.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 6, maxWidth: 800 }}>
                <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                    <Fade in={true} timeout={500}>
                        <Card
                            sx={{
                                width: "100%",
                                borderRadius: 4,
                                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: (theme) => theme.shadows[10],
                                },
                            }}
                            elevation={4}
                        >
                            <CardActionArea
                                onClick={() => navigate("/search")}
                                sx={{
                                    height: "100%",
                                    p: 4,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        borderRadius: "50%",
                                        bgcolor: "primary.light",
                                        color: "primary.contrastText",
                                        display: "flex",
                                    }}
                                >
                                    <ManageSearch fontSize="large" sx={{ fontSize: 40 }} />
                                </Box>
                                <CardContent sx={{ p: 0, textAlign: "center" }}>
                                    <Typography gutterBottom variant="h5" component="div" fontWeight="medium">
                                        Search
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Search through all archived transcripts.
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Fade>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                    <Fade in={true} timeout={700}>
                        <Card
                            sx={{
                                width: "100%",
                                borderRadius: 4,
                                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: (theme) => theme.shadows[10],
                                },
                            }}
                            elevation={4}
                        >
                            <CardActionArea
                                onClick={() => navigate("/graph")}
                                sx={{
                                    height: "100%",
                                    p: 4,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        borderRadius: "50%",
                                        bgcolor: "secondary.light",
                                        color: "secondary.contrastText",
                                        display: "flex",
                                    }}
                                >
                                    <Assessment fontSize="large" sx={{ fontSize: 40 }} />
                                </Box>
                                <CardContent sx={{ p: 0, textAlign: "center" }}>
                                    <Typography gutterBottom variant="h5" component="div" fontWeight="medium">
                                        Graph
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        View word count graphs for streams.
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* --- Inputs Section --- */}
            <Fade in={true} timeout={900}>
                <Card sx={{ p: 4, borderRadius: 4, maxWidth: 600, width: "100%" }} elevation={2}>
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="medium" align="center" gutterBottom>
                            Direct Access
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexDirection: isMobile ? "column" : "row" }}>
                            <TextField
                                fullWidth
                                label="View Transcript by ID"
                                variant="outlined"
                                value={transcriptId}
                                onChange={(e) => setTranscriptId(e.target.value)}
                                onKeyDown={handleTranscriptKeyDown}
                                size="small"
                            />
                            <Button
                                variant="contained"
                                onClick={handleViewTranscript}
                                disabled={!transcriptId.trim()}
                                sx={{ minWidth: 80 }}
                            >
                                View
                            </Button>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, flexDirection: isMobile ? "column" : "row" }}>
                            <TextField
                                fullWidth
                                label="Graph Stream by ID"
                                variant="outlined"
                                value={graphId}
                                onChange={(e) => setGraphId(e.target.value)}
                                onKeyDown={handleGraphKeyDown}
                                size="small"
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleViewGraph}
                                disabled={!graphId.trim()}
                                sx={{ minWidth: 80 }}
                            >
                                Graph
                            </Button>
                        </Box>
                    </Stack>
                </Card>
            </Fade>

            <Box sx={{ mt: 6, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Looking for active streams?
                </Typography>
                <Button
                    href="/live-transcript"
                    variant="outlined"
                    size="large"
                    sx={{
                        mt: 1,
                        borderRadius: 2,
                        px: 4,
                        textTransform: "none",
                    }}
                >
                    Go to Live-Transcript
                </Button>
            </Box>
        </Container>
    );
}
