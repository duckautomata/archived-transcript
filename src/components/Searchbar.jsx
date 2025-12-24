import { Box, Grid, TextField } from "@mui/material";
import { useAppStore } from "../store/store";
import { useEffect, useRef } from "react";

/**
 * A component for searching text in transcripts.
 * Search text is stored in the app store.
 * @param {Object} props
 * @param {function} [props.onSearch] - Callback to trigger search when Enter is pressed
 */
export default function Searchbar({ onSearch }) {
    const searchText = useAppStore((state) => state.searchText);
    const setSearchText = useAppStore((state) => state.setSearchText);
    const searchInputRef = useRef(null);

    // Override Ctrl+F to focus search input
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "f") {
                event.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    searchInputRef.current.select();
                }
            } else if (event.key === "Escape") {
                if (searchInputRef.current && document.activeElement === searchInputRef.current) {
                    searchInputRef.current.blur();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && onSearch) {
            onSearch();
        }
    };

    return (
        <Box sx={{ mb: 4, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={12}>
                    <TextField
                        inputRef={searchInputRef}
                        fullWidth
                        label="Search Text"
                        variant="outlined"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
