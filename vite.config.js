import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
                    console.log(`\nGenerated version.json with buildTime: ${buildTime}`); // eslint-disable-line no-console
                },
            },
        ],
        base: "/archived-transcript",
        define: {
            __BUILD_TIME__: buildTime,
        },
        server: {
            port: 5173,
            open: false,
        },
        build: {
            emptyOutDir: true,
            manifest: false,
            target: "esnext",
            outDir: "archived-transcript", // should be the same as base
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
