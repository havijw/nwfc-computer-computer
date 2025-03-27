import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// TODO add config for production builds from pyodide docs:
// https://pyodide.org/en/latest/usage/working-with-bundlers.html

// https://vite.dev/config/
export default defineConfig({
  // https://pyodide.org/en/latest/usage/working-with-bundlers.html
  optimizeDeps: { exclude: ["pyodide"] },
  plugins: [react()],
})
