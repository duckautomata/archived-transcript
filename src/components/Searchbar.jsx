import { Box, Grid, TextField } from "@mui/material";
import { useAppStore } from "../store/store";

/**
 * A component for searching text in transcripts.
 * Search text is stored in the app store.
 */
export default function Searchbar() {
    const searchText = useAppStore((state) => state.searchText);
    const setSearchText = useAppStore((state) => state.setSearchText);

    return (
        <Box sx={{ mb: 4, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={12}>
                    <TextField
                        fullWidth
                        label="Search Text"
                        variant="outlined"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
