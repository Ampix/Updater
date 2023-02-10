import { defineConfig } from "vite";
const path = require("path");
import { svelte } from "@sveltejs/vite-plugin-svelte";
import autoPreprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte({
            preprocess: autoPreprocess(),
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/main.js"),
            name: "AmpixUpdater",
            fileName: (format) => `updater.${format}.js`,
        },
        outDir: "src/dist",
    },
});
