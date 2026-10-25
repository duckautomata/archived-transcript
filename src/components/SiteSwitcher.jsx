import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    Divider,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";
import { Check, GridViewOutlined, NorthEast } from "@mui/icons-material";
import { CURRENT_SITE_ID, hubUrl, sites } from "../logic/sites";

const BUTTON_ID = "site-switcher-button";
const MENU_ID = "site-switcher-menu";
const HUB_URL = hubUrl();

// Beside the sidebar on desktop. The mobile drawer is too narrow for that, so there the menu drops down instead.
const DESKTOP_PLACEMENT = {
    anchorOrigin: { vertical: "top", horizontal: "right" },
    transformOrigin: { vertical: "top", horizontal: "left" },
};
const MOBILE_PLACEMENT = {
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
};

/**
 * A site's favicon at icon size; the 2x source keeps it sharp on high density screens. Another site's favicon is
 * missing when running locally, so a failed load leaves a blank space instead of a broken image.
 */
const SiteIcon = ({ site }) => (
    <Box
        component="img"
        src={site.icon}
        srcSet={`${site.icon} 1x, ${site.icon2x} 2x`}
        alt=""
        width={24}
        height={24}
        onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
        }}
        sx={{ display: "block" }}
    />
);

/**
 * Sidebar entry that switches between the transcript sites. The button (grid icon and site name) opens a menu
 * listing every transcript site and the page with all sites. This site is marked and leads back to its home page;
 * the others are ordinary page loads.
 * @param {object} props
 * @param {boolean} props.showLabels - Whether the site name is shown next to the icon.
 * @param {boolean} props.collapsed - Whether the sidebar is collapsed to icons, so the button gets a tooltip.
 * @param {boolean} props.isMobile - Whether the sidebar is the mobile drawer.
 * @param {object} props.buttonSx - Styles shared with the other sidebar buttons.
 * @param {object} props.iconSx - Styles shared with the other sidebar icons.
 * @param {function(): void} props.onNavigate - Called when this site's home page is chosen.
 */
export default function SiteSwitcher({ showLabels, collapsed, isMobile, buttonSx, iconSx, onNavigate }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const currentSite = sites.find((site) => site.id === CURRENT_SITE_ID);

    const closeMenu = () => setAnchorEl(null);

    const goHome = () => {
        closeMenu();
        onNavigate();
    };

    return (
        <>
            <ListItem disablePadding>
                <Tooltip title={collapsed ? "Switch site" : ""} placement="right">
                    <ListItemButton
                        id={BUTTON_ID}
                        data-testid="site-switcher-button"
                        aria-haspopup="true"
                        aria-controls={open ? MENU_ID : undefined}
                        aria-expanded={open ? "true" : undefined}
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                        sx={buttonSx}
                    >
                        <ListItemIcon sx={iconSx}>
                            <GridViewOutlined />
                        </ListItemIcon>
                        {showLabels && <ListItemText primary={currentSite.title} />}
                    </ListItemButton>
                </Tooltip>
            </ListItem>
            <Menu
                id={MENU_ID}
                data-testid="site-switcher-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={closeMenu}
                {...(isMobile ? MOBILE_PLACEMENT : DESKTOP_PLACEMENT)}
                slotProps={{
                    list: { "aria-labelledby": BUTTON_ID },
                    paper: { sx: { minWidth: 220, ml: isMobile ? 0 : 0.5 } },
                }}
            >
                {sites.map((site) =>
                    site.id === CURRENT_SITE_ID ? (
                        <MenuItem
                            key={site.id}
                            component={RouterLink}
                            to="/"
                            selected
                            aria-current="true"
                            onClick={goHome}
                            data-testid={`site-switcher-${site.id}`}
                        >
                            <ListItemIcon>
                                <SiteIcon site={site} />
                            </ListItemIcon>
                            <ListItemText primary={site.title} />
                            <Check fontSize="small" color="primary" sx={{ ml: 2 }} />
                        </MenuItem>
                    ) : (
                        <MenuItem
                            key={site.id}
                            component="a"
                            href={site.path}
                            onClick={closeMenu}
                            data-testid={`site-switcher-${site.id}`}
                        >
                            <ListItemIcon>
                                <SiteIcon site={site} />
                            </ListItemIcon>
                            <ListItemText primary={site.title} />
                        </MenuItem>
                    ),
                )}
                <Divider />
                <MenuItem component="a" href={HUB_URL} onClick={closeMenu} data-testid="site-switcher-all-sites">
                    <ListItemIcon>
                        <GridViewOutlined />
                    </ListItemIcon>
                    <ListItemText primary="All my sites" />
                    <NorthEast fontSize="small" sx={{ ml: 2, color: "text.secondary" }} />
                </MenuItem>
            </Menu>
        </>
    );
}
