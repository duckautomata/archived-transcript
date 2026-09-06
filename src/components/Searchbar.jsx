import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Clear, Search as SearchIcon } from "@mui/icons-material";
import { useAppStore } from "../store/store";
import { useEffect, useRef } from "react";

/**
 * Text field for the word or phrase to look for. The value is stored in the app store.
 * Submitting is handled by the surrounding form (Enter key / Search button), so this component only
 * renders the field. Ctrl+F (Cmd+F) focuses the field and Escape blurs it.
 */
export default function Searchbar() {
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

    /** Empty the field and put the cursor back into it. */
    const handleClear = () => {
        setSearchText("");
        searchInputRef.current?.focus();
    };

    return (
        <TextField
            inputRef={searchInputRef}
            fullWidth
            label="Search Text"
            placeholder="Word or phrase to look for"
            variant="outlined"
            data-testid="search-text-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" fontSize="small" />
                        </InputAdornment>
                    ),
                    endAdornment: searchText ? (
                        <InputAdornment position="end">
                            <IconButton
                                type="button"
                                aria-label="clear search text"
                                data-testid="clear-search-text"
                                onClick={handleClear}
                                edge="end"
                                size="small"
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ) : null,
                },
            }}
        />
    );
}
