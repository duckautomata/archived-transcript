import config from "./playwright.config.js";

const devConfig = {
    ...config,
    use: {
        ...config.use,
        baseURL: "http://localhost:5173/archived-transcript/",
    },
    webServer: {
        ...config.webServer,
        command: "npm run dev",
        url: "http://localhost:5173/archived-transcript/",
    },
};

export default devConfig;
