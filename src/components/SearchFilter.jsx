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
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useAppStore } from "../store/store";
import { streamers, streamTypes } from "../config";

/**
 * A component for filtering transcripts based on streamer, type, date range, title and match whole word.
 * All filters are stored in the app store.
 */
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

    // Each filter counts once, no matter how many stream types are selected.
    const activeFilterCount = [
        Boolean(streamer),
        streamType.length > 0,
        Boolean(fromDate),
        Boolean(toDate),
        Boolean(streamTitle),
        matchWholeWord,
    ].filter(Boolean).length;

    // Dates are "YYYY-MM-DD" strings, so a plain string comparison orders them correctly.
    const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

    const handleTypeChange = (event) => {
        const {
            target: { value },
        } = event;
        setStreamType(typeof value === "string" ? value.split(",") : value);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Filters
                </Typography>
                {activeFilterCount > 0 && (
                    <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`${activeFilterCount} active`}
                        data-testid="active-filter-count"
                    />
                )}
            </Stack>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                {/* Streamer Dropdown */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth sx={{ minWidth: 80 }}>
                        <InputLabel id="streamer-select-label">Streamer</InputLabel>
                        <Select
                            labelId="streamer-select-label"
                            label="Streamer"
                            data-testid="streamer-select"
                            value={streamer}
                            onChange={(e) => setStreamer(e.target.value)}
                        >
                            <MenuItem value="">Any</MenuItem>
                            {streamers.map((name) => (
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
                            data-testid="type-select"
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
                        data-testid="start-date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        error={dateRangeInvalid}
                        helperText={dateRangeInvalid ? "From date is after To date" : undefined}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Grid>

                {/* End Date */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                        fullWidth
                        label="To"
                        type="date"
                        data-testid="end-date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        error={dateRangeInvalid}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Grid>

                {/* Stream Title */}
                <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                        fullWidth
                        label="Stream Title"
                        variant="outlined"
                        data-testid="stream-title"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                    />
                </Grid>

                {/* Boolean Toggles */}
                <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
                    <FormGroup
                        sx={{
                            width: "100%",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={matchWholeWord}
                                    data-testid="match-whole-word-switch"
                                    onChange={(e) => setMatchWholeWord(e.target.checked)}
                                />
                            }
                            label="Match Whole Word"
                        />
                    </FormGroup>
                </Grid>
            </Grid>
        </Box>
    );
}
