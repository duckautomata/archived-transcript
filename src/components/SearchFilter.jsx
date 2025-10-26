// streamer, type, date range, match case, match whole word, punctuiation sensitive

import {
    Box,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Switch,
    TextField,
} from "@mui/material";
import { useAppStore } from "../store/store";

export default function SearchFilter() {
    const streamer = useAppStore((state) => state.streamer);
    const streamType = useAppStore((state) => state.streamType);
    const fromDate = useAppStore((state) => state.fromDate);
    const toDate = useAppStore((state) => state.toDate);
    const streamTitle = useAppStore((state) => state.streamTitle);
    const matchWholeWord = useAppStore((state) => state.matchWholeWord);

    const setStreamer = useAppStore((state) => state.setStreamer);
    const setStreamType = useAppStore((state) => state.setStreamType);
    const setFromDate = useAppStore((state) => state.setFromDate);
    const setToDate = useAppStore((state) => state.setToDate);
    const setStreamTitle = useAppStore((state) => state.setStreamTitle);
    const setMatchWholeWord = useAppStore((state) => state.setMatchWholeWord);

    const uniqueStreamers = ["Dokibird", "MintFantome"];
    const streamTypes = ["Video", "Stream", "Twitch", "TwitchVod", "External"];

    const handleTypeChange = (event) => {
        const {
            target: { value },
        } = event;
        setStreamType(typeof value === "string" ? value.split(",") : value);
    };

    return (
        <>
            Filter
            <Box sx={{ mb: 4, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Streamer Dropdown */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth sx={{ minWidth: 80 }}>
                            <InputLabel id="streamer-select-label">Streamer</InputLabel>
                            <Select
                                labelId="streamer-select-label"
                                label="Streamer"
                                value={streamer}
                                onChange={(e) => setStreamer(e.target.value)}
                            >
                                <MenuItem value="">Any</MenuItem>
                                {uniqueStreamers.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Type Multi-select */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth sx={{ minWidth: 120 }}>
                            <InputLabel id="type-select-label">Type</InputLabel>
                            <Select
                                labelId="type-select-label"
                                multiple
                                value={streamType}
                                onChange={handleTypeChange}
                                input={<OutlinedInput label="Type" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {streamTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        <Checkbox checked={streamType.includes(type)} />
                                        <ListItemText primary={type} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Start Date */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="From"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* End Date */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="To"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Stream Title */}
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            fullWidth
                            label="Stream Title"
                            variant="outlined"
                            value={streamTitle}
                            onChange={(e) => setStreamTitle(e.target.value)}
                        />
                    </Grid>

                    {/* Boolean Toggles */}
                    <Grid size={4}>
                        <FormGroup
                            sx={{
                                flexDirection: { xs: "column", sm: "row" },
                                justifyContent: "center",
                                gap: 2,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={matchWholeWord}
                                        onChange={(e) => setMatchWholeWord(e.target.checked)}
                                    />
                                }
                                label="Match Whole Word"
                            />
                        </FormGroup>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
