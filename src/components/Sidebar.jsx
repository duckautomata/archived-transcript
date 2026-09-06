import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { GitHub, Help, Home, ManageSearch, InfoOutlined } from "@mui/icons-material";
import { Tooltip, useMediaQuery } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAppStore } from "../store/store";

const GITHUB_URL = "https://github.com/duckautomata/archived-transcript";

/**
 * The main application sidebar containing navigation and page selection.
 * Navigation items are real links so they can be opened in a new tab (middle-click / ctrl+click).
 * @param {object} props
 * @param {React.ReactNode} props.children - The main content area children.
 */
export default function Sidebar({ children }) {
    const { pathname } = useLocation();

    const sidebarOpen = useAppStore((state) => state.sidebarOpen);
    const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
    const setInfoOpen = useAppStore((state) => state.setInfoOpen);
    const setHelpOpen = useAppStore((state) => state.setHelpOpen);
    const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);

    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:768px)");
    const drawerWidth = isMobile ? 180 : 200;
    const drawerWidthCollapsed = 60;

    // On desktop the drawer can be collapsed to icons only; on mobile it is either fully open or hidden.
    const collapsed = !isMobile && !sidebarOpen;
    const showLabels = !collapsed;

    const pages = [
        { name: "Search", icon: <ManageSearch />, path: "/search" },
        { name: "Graph", icon: <AssessmentIcon />, path: "/graph" },
    ];

    const itemButtonSx = {
        justifyContent: collapsed ? "center" : "initial",
        px: 2.5,
        overflow: "hidden",
    };

    const itemIconSx = { minWidth: 0, mr: collapsed ? "auto" : 3 };

    /** Tooltip text shown next to an icon-only item; hidden when the label is visible. */
    const tooltipFor = (name) => (collapsed ? name : "");

    const handleCollapseToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const closeMobileDrawer = () => {
        if (isMobile) setMobileOpen(false);
    };

    return (
        <Box sx={{ display: "flex" }}>
            {/* Floating Hamburger for Mobile */}
            {isMobile && !mobileOpen && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 10,
                        left: 10,
                        zIndex: 1200, // Above other content
                        backgroundColor: "background.paper",
                        borderRadius: "50%",
                        boxShadow: 2,
                    }}
                >
                    <ListItemButton
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        sx={{ borderRadius: "50%", p: 1 }}
                    >
                        <MenuIcon />
                    </ListItemButton>
                </Box>
            )}
            <Drawer
                open={isMobile ? mobileOpen : true}
                variant={isMobile ? "temporary" : "persistent"}
                onClose={isMobile ? () => setMobileOpen(false) : undefined}
                sx={{
                    width: isMobile ? drawerWidth : sidebarOpen ? drawerWidth : drawerWidthCollapsed,
                    flexShrink: 0,
                    // Animate the reserved space in step with the (fixed) drawer paper so content does not jump
                    transition: "width 0.3s ease-in-out",
                    "& .MuiDrawer-paper": {
                        width: isMobile ? drawerWidth : sidebarOpen ? drawerWidth : drawerWidthCollapsed,
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        transition: "width 0.3s ease-in-out",
                    },
                }}
            >
                <Box sx={{ overflowY: "auto", overflowX: "hidden" }}>
                    <List>
                        {/* Collapse/Expand Button */}
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={handleCollapseToggle}
                                aria-label="Toggle sidebar"
                                aria-expanded={isMobile ? mobileOpen : sidebarOpen}
                                sx={{
                                    justifyContent: collapsed ? "center" : "initial",
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon sx={itemIconSx}>
                                    <MenuIcon />
                                </ListItemIcon>
                                {showLabels && <ListItemText primary="" />}
                            </ListItemButton>
                        </ListItem>
                        {/* Home Button */}
                        <ListItem disablePadding>
                            <Tooltip title={tooltipFor("Home")} placement="right">
                                <ListItemButton
                                    component={RouterLink}
                                    to="/"
                                    selected={pathname === "/"}
                                    aria-current={pathname === "/" ? "page" : undefined}
                                    onClick={closeMobileDrawer}
                                    sx={itemButtonSx}
                                >
                                    <ListItemIcon sx={itemIconSx}>
                                        <Home />
                                    </ListItemIcon>
                                    {showLabels && <ListItemText primary="Home" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {collapsed && <ListItem sx={{ height: 16 }} />}
                        {/* Page Selection */}
                        <ListItemText primary="Pages" sx={{ mt: 2, ml: 1, display: showLabels ? "block" : "none" }} />
                        {pages.map((page) => (
                            <ListItem key={page.path} disablePadding>
                                <Tooltip title={tooltipFor(page.name)} placement="right">
                                    <ListItemButton
                                        component={RouterLink}
                                        to={page.path}
                                        selected={pathname.startsWith(page.path)}
                                        aria-current={pathname.startsWith(page.path) ? "page" : undefined}
                                        onClick={closeMobileDrawer}
                                        sx={itemButtonSx}
                                    >
                                        <ListItemIcon sx={itemIconSx}>{page.icon}</ListItemIcon>
                                        {showLabels && <ListItemText primary={page.name} />}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        ))}
                        {/* GitHub */}
                        <ListItem disablePadding sx={{ mt: 2 }}>
                            <Tooltip title="Source code on GitHub (opens in a new tab)" placement="right" describeChild>
                                <ListItemButton
                                    component="a"
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                    sx={itemButtonSx}
                                >
                                    <ListItemIcon sx={itemIconSx}>
                                        <GitHub />
                                    </ListItemIcon>
                                    {showLabels && <ListItemText primary="GitHub" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {/* Help */}
                        <ListItem disablePadding>
                            <Tooltip title={tooltipFor("Help")} placement="right">
                                <ListItemButton onClick={() => setHelpOpen(true)} sx={itemButtonSx}>
                                    <ListItemIcon sx={itemIconSx}>
                                        <Help />
                                    </ListItemIcon>
                                    {showLabels && <ListItemText primary="Help" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {/* Info */}
                        <ListItem disablePadding>
                            <Tooltip title={tooltipFor("System Info")} placement="right">
                                <ListItemButton onClick={() => setInfoOpen(true)} sx={itemButtonSx}>
                                    <ListItemIcon sx={itemIconSx}>
                                        <InfoOutlined />
                                    </ListItemIcon>
                                    {showLabels && <ListItemText primary="System Info" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {/* Settings */}
                        <ListItem disablePadding>
                            <Tooltip title={tooltipFor("Settings")} placement="right">
                                <ListItemButton onClick={() => setSettingsOpen(true)} sx={itemButtonSx}>
                                    <ListItemIcon sx={itemIconSx}>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    {showLabels && <ListItemText primary="Settings" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: "100%", padding: 1 }}>
                {children}
            </Box>
        </Box>
    );
}
