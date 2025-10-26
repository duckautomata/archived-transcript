// Stream title, text, regex

import { Box, Grid, TextField } from "@mui/material";
import { useAppStore } from "../store/store";

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
