
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import istanbul from 'vite-plugin-istanbul'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
  },
  plugins: [
   ...(process.env.NODE_ENV !== 'production' ? [
      istanbul({
        include: 'src/*',
        exclude: ['node_modules', 'test/', '**/*.test.*'],
        extension: ['.js', '.jsx', '.ts', '.tsx'],
        requireEnv: false,
        cypress: true
      })
    ] : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
