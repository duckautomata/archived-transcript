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
        </ThemeProvider>
    );
}

export default App;
