import { defineConfig, HmrContext, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// https://pyodide.org/en/latest/usage/working-with-bundlers.html
const PYODIDE_EXCLUDE = [
  "!**/*.{md,html}",
  "!**/*.d.ts",
  // We need the installed wheel files in our app, so don't exclude them
  // "!**/*.whl",
  "!**/node_modules",
];

export function viteStaticCopyPyodide() {
  const pyodideDir = dirname(fileURLToPath(import.meta.resolve("pyodide")));
  return viteStaticCopy({
    targets: [
      {
        src: [join(pyodideDir, "*")].concat(PYODIDE_EXCLUDE),
        dest: "assets",
      },
    ],
  });
}

export function vitePythonRefresh() {
  return {
    name: "full-reload-for-python",
    handleHotUpdate({ file, server }: HmrContext) {
      if (file.endsWith(".py")) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // https://pyodide.org/en/latest/usage/working-with-bundlers.html
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [react(), viteStaticCopyPyodide(), vitePythonRefresh()],
  // Server python files in dev. Not needed for production because a wheel is built.
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "/python/"],
    },
  },
  base: "/nwfc-computer-computer/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  worker: {
    format: "es",
  },
});
