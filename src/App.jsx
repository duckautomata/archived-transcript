import "./App.css";
import { CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { darkTheme, lightTheme } from "./theme";
import { Route, Routes } from "react-router-dom";
import { useAppStore } from "./store/store";
import Home from "./components/Home";
import Maintenance from "./components/Maintenance";
import Sidebar from "./components/Sidebar";
import Search from "./components/Search";
import Graph from "./components/Graph";
import Transcript from "./components/Transcript";
import GraphSingle from "./components/GraphSingle";
import UpdateAlert from "./components/UpdateAlert";
import EnvironmentBadge from "./components/EnvironmentBadge";
import SettingsPopup from "./components/SettingsPopup";
import HelpPopup from "./components/HelpPopup";
import InfoPopup from "./components/InfoPopup";

function App() {
    const theme = useAppStore((state) => state.theme);
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    let colorTheme = prefersDarkMode ? darkTheme : lightTheme;
    if (theme === "light") {
        colorTheme = lightTheme;
    } else if (theme === "dark") {
        colorTheme = darkTheme;
    }

    return (
        <ThemeProvider theme={colorTheme}>
            <CssBaseline />
            <UpdateAlert />
            <EnvironmentBadge />
            {window.maintenance ? (
                <Routes>
                    <Route path={"*"} element={<Maintenance />} />
                </Routes>
            ) : (
                <>
                    <Sidebar>
                        <Routes>
                            <Route path={"*"} element={<Home />} />
                            <Route path={"search/"} element={<Search />} />
                            <Route path={"graph/"} element={<Graph />} />
                            <Route path={"graph/:id"} element={<GraphSingle />} />
                            <Route path={"transcript/:id"} element={<Transcript />} />
                        </Routes>
                    </Sidebar>
                </>
            )}
            <SettingsPopup />
            <HelpPopup />
            <InfoPopup />
        </ThemeProvider>
    );
}

export default App;
