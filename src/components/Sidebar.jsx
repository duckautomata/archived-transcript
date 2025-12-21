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
import HelpPopup from "./HelpPopup";
import SettingsPopup from "./SettingsPopup";
import { GitHub, Help, Home, ManageSearch } from "@mui/icons-material";
import { Tooltip, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/store";

/**
 * The main application sidebar containing navigation and page selection.
 * @param {object} props
 * @param {React.ReactNode} props.children - The main content area children.
 */
export default function Sidebar({ children }) {
    const navigate = useNavigate();

    const sidebarOpen = useAppStore((state) => state.sidebarOpen);
    const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:768px)");
    const drawerWidth = isMobile ? 180 : 200;
    const drawerWidthCollapsed = 60;

    const pages = [
        { name: "Search", icon: <ManageSearch />, value: "search" },
        { name: "Graph", icon: <AssessmentIcon />, value: "graph" },
    ];

    const handleCollapseToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const handleHomeButton = () => {
        handlePageChange("/");
    };

    const handlePageChange = (value) => {
        if (isMobile) setMobileOpen(false);
        navigate(value);
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
                    <ListItemButton onClick={() => setMobileOpen(true)} sx={{ borderRadius: "50%", p: 1 }}>
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
                    "& .MuiDrawer-paper": {
                        width: isMobile ? drawerWidth : sidebarOpen ? drawerWidth : drawerWidthCollapsed,
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        transition: "width 0.3s ease-in-out",
                    },
                }}
            >
                <Box sx={{ overflow: "hidden" }}>
                    <List>
                        {/* Collapse/Expand Button */}
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleCollapseToggle} sx={{ justifyContent: "center" }}>
                                <ListItemIcon sx={{ minWidth: 0 }}>
                                    <MenuIcon />
                                </ListItemIcon>
                                {((!isMobile && sidebarOpen) || isMobile) && <ListItemText primary="" />}
                            </ListItemButton>
                        </ListItem>
                        {/* Home Button */}
                        <ListItem disablePadding>
                            <Tooltip title={!isMobile && !sidebarOpen ? "Home" : ""} placement="right">
                                <ListItemButton
                                    onClick={handleHomeButton}
                                    sx={{
                                        paddingLeft: !isMobile && !sidebarOpen ? 2.4 : undefined,
                                        overflow: "hidden",
                                    }}
                                >
                                    <ListItemIcon>
                                        <Home />
                                    </ListItemIcon>
                                    {((!isMobile && sidebarOpen) || isMobile) && <ListItemText primary="Home" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {!isMobile && !sidebarOpen && <ListItem sx={{ height: 16 }} />}
                        {/* Page Selection */}
                        <ListItemText
                            primary="Pages"
                            sx={{ mt: 2, ml: 1, display: (!isMobile && sidebarOpen) || isMobile ? "block" : "none" }}
                        />
                        {pages.map((page) => (
                            <ListItem key={page.value} disablePadding>
                                <Tooltip title={!isMobile && !sidebarOpen ? page.name : ""} placement="right">
                                    <ListItemButton
                                        selected={window.location.pathname.split("/")[3] === page.value}
                                        onClick={() => handlePageChange(page.value)}
                                        sx={{
                                            paddingLeft: !isMobile && !sidebarOpen ? 2 : undefined,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <ListItemIcon>{page.icon}</ListItemIcon>
                                        {((!isMobile && sidebarOpen) || isMobile) && (
                                            <ListItemText primary={page.name} />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        ))}
                        {/* GitHub */}
                        <ListItem disablePadding sx={{ mt: 2 }}>
                            <Tooltip title="https://github.com/duckautomata/archived-transcript" placement="right">
                                <ListItemButton
                                    onClick={() => {
                                        window.open(
                                            "https://github.com/duckautomata/archived-transcript",
                                            "_blank",
                                            "noopener noreferrer",
                                        );
                                    }}
                                    sx={{ paddingLeft: !isMobile && !sidebarOpen ? 2 : undefined, overflow: "hidden" }}
                                >
                                    <ListItemIcon>
                                        <GitHub />
                                    </ListItemIcon>
                                    {((!isMobile && sidebarOpen) || isMobile) && <ListItemText primary="GitHub" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {/* Help */}
                        <ListItem disablePadding>
                            <Tooltip title={!isMobile && !sidebarOpen ? "Help" : ""} placement="right">
                                <ListItemButton
                                    onClick={() => setHelpOpen(true)}
                                    sx={{ paddingLeft: !isMobile && !sidebarOpen ? 2 : undefined, overflow: "hidden" }}
                                >
                                    <ListItemIcon>
                                        <Help />
                                    </ListItemIcon>
                                    {((!isMobile && sidebarOpen) || isMobile) && <ListItemText primary="Help" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                        {/* Settings */}
                        <ListItem disablePadding>
                            <Tooltip title={!isMobile && !sidebarOpen ? "Settings" : ""} placement="right">
                                <ListItemButton
                                    onClick={() => setSettingsOpen(true)}
                                    sx={{ paddingLeft: !isMobile && !sidebarOpen ? 2 : undefined, overflow: "hidden" }}
                                >
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    {((!isMobile && sidebarOpen) || isMobile) && <ListItemText primary="Settings" />}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                    <SettingsPopup open={settingsOpen} setOpen={setSettingsOpen} />
                    <HelpPopup open={helpOpen} setOpen={setHelpOpen} />
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 1,
                    width: isMobile ? "100%" : `calc(97vw - ${sidebarOpen ? drawerWidth : drawerWidthCollapsed}px)`,
                    transition: "width 0.3s ease-in-out, margin-left 0.3s ease-in-out",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
