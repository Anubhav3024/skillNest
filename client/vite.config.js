import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiTarget = (env.VITE_API_URL || env.VITE_BASE_URL || "http://localhost:5000").trim()

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/media": { target: apiTarget, changeOrigin: true },
        // NOTE: these proxies must not capture the SPA routes `/auth` and `/instructor`.
        // Using a trailing slash keeps API calls working (e.g. `/auth/login`) while allowing
        // the frontend router to own `/auth` and `/instructor` page loads.
        "/auth/": { target: apiTarget, changeOrigin: true },
        "/instructor/": { target: apiTarget, changeOrigin: true },
        "/student": { target: apiTarget, changeOrigin: true },
        "/user": { target: apiTarget, changeOrigin: true },
        "/admin": { target: apiTarget, changeOrigin: true },
        "/api": { target: apiTarget, changeOrigin: true },
        "/notifications": { target: apiTarget, changeOrigin: true },
        "/socket.io": { target: apiTarget, changeOrigin: true, ws: true },
      },
    },
  }
})
