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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getGraphPath, getTranscriptPath } from "../logic/videoLinks";
import { usePageTitle } from "../logic/usePageTitle";

const cardSx = {
    width: "100%",
    borderRadius: 4,
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: (theme) => theme.shadows[10],
    },
};

const cardActionSx = {
    height: "100%",
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
};

/**
 * Props that turn a Button into a real in-app link (so middle-click / ctrl+click open a new tab).
 * While `path` is empty the button stays a plain button instead of rendering a link to nowhere.
 * @param {string} path - In-app path, or "" when there is nothing to link to yet
 * @returns {object}
 */
function linkProps(path) {
    return path ? { component: RouterLink, to: path } : {};
}

/**
 * Landing page: links to the Search / Graph pages, direct access to a transcript or graph by id,
 * and a link to the live site.
 */
export default function Home() {
    usePageTitle("");
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:599px)");
    const [transcriptId, setTranscriptId] = useState("");
    const [graphId, setGraphId] = useState("");

    const trimmedTranscriptId = transcriptId.trim();
    const trimmedGraphId = graphId.trim();
    const transcriptPath = trimmedTranscriptId ? getTranscriptPath(trimmedTranscriptId) : "";
    const graphPath = trimmedGraphId ? getGraphPath(trimmedGraphId) : "";

    const handleTranscriptKeyDown = (e) => {
        if (e.key === "Enter" && transcriptPath) {
            navigate(transcriptPath);
        }
    };

    const handleGraphKeyDown = (e) => {
        if (e.key === "Enter" && graphPath) {
            navigate(graphPath);
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
                    sx={{
                        fontWeight: "bold",
                        background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.alt})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        textFillColor: "transparent",
                        WebkitTextFillColor: "transparent",
                        mb: 2,
                    }}
                >
                    Archived Transcripts
                </Typography>
                <Typography variant="h6" sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
                    Search past streams or view specific transcripts.
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ justifyContent: "center", alignItems: "stretch", mb: 6, maxWidth: 800 }}>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
                    <Fade in={true} timeout={500}>
                        <Card sx={cardSx} elevation={4}>
                            <CardActionArea
                                component={RouterLink}
                                to="/search"
                                data-testid="search-btn"
                                sx={cardActionSx}
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
                                    <Typography variant="h5" component="div" sx={{ fontWeight: "medium", mb: 1 }}>
                                        Search
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Search through all archived transcripts.
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Fade>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
                    <Fade in={true} timeout={700}>
                        <Card sx={cardSx} elevation={4}>
                            <CardActionArea
                                component={RouterLink}
                                to="/graph"
                                data-testid="graph-btn"
                                sx={cardActionSx}
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
                                    <Typography variant="h5" component="div" sx={{ fontWeight: "medium", mb: 1 }}>
                                        Graph
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                        <Typography variant="h6" sx={{ fontWeight: "medium", textAlign: "center", mb: 1 }}>
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
                                {...linkProps(transcriptPath)}
                                disabled={!transcriptPath}
                                data-testid="view-transcript-btn"
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
                                {...linkProps(graphPath)}
                                disabled={!graphPath}
                                data-testid="graph-stream-btn"
                                sx={{ minWidth: 80 }}
                            >
                                Graph
                            </Button>
                        </Box>
                    </Stack>
                </Card>
            </Fade>

            <Box sx={{ mt: 6, textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
                    Looking for active streams?
                </Typography>
                <Button
                    href="/live-transcript/"
                    variant="outlined"
                    size="large"
                    data-testid="live-btn"
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
