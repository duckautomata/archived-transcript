import { Fab, Tooltip, Zoom, useScrollTrigger } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";

/**
 * Floating "back to top" button that appears once the window has been scrolled down.
 * @param {object} props
 * @param {number} [props.threshold] - Scroll offset (px) after which the button shows.
 * @param {() => void} [props.onClick] - Custom scroll handler; defaults to scrolling the window to the top.
 */
export default function ScrollToTopFab({ threshold = 300, onClick }) {
    const visible = useScrollTrigger({ disableHysteresis: true, threshold });

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    };

    return (
        <Zoom in={visible}>
            <Tooltip title="Back to top" placement="left">
                <Fab
                    color="primary"
                    size="small"
                    aria-label="scroll back to top"
                    data-testid="scroll-to-top"
                    onClick={handleClick}
                    sx={{
                        position: "fixed",
                        bottom: { xs: 20, sm: 32 },
                        right: { xs: 20, sm: 32 },
                        boxShadow: 3,
                        zIndex: (theme) => theme.zIndex.speedDial,
                    }}
                >
                    <KeyboardArrowUp />
                </Fab>
            </Tooltip>
        </Zoom>
    );
}
