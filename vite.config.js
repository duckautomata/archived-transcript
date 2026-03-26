// oxlint-disable no-console
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
    const buildTime = new Date().getTime();

    return {
        plugins: [
            react(),
            {
                name: "generate-version-json",
                writeBundle(options) {
                    const outDir = options.dir || "archived-transcript";
                    const versionFilePath = path.resolve(outDir, "version.json");
                    fs.writeFileSync(versionFilePath, JSON.stringify({ buildTime }));
                    console.log(`\nGenerated version.json with buildTime: ${buildTime}`);
                },
            },
        ],
        base: "/archived-transcript/",
        define: {
            __BUILD_TIME__: buildTime,
        },
        server: {
            port: 5173,
            open: false,
        },
        test: {
            environment: "jsdom",
            globals: true,
            setupFiles: "./src/setupTests.js",
        },
        build: {
            emptyOutDir: true,
            manifest: false,
            target: "esnext",
            outDir: "dist/archived-transcript", // should be the same as base
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                    },
                },
            },
        },
    };
});
