import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(() => ({
    plugins: [react()],
    base: "/archived-transcript",
    server: {
        port: 5173,
        open: false,
    },
    build: {
        emptyOutDir: true,
        manifest: false,
        target: "esnext",
        outDir: "archived-transcript", // should be the same as base
    },
}));
