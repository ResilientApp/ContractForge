import path from "node:path"
import type { IncomingMessage, ServerResponse } from "node:http"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { forwardToDeepSeek } from "./api/lib/deepseekForward"

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (c) => chunks.push(c as Buffer))
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8")
        resolve(text ? JSON.parse(text) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on("error", reject)
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
      {
        name: "deepseek-api-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split("?")[0] ?? ""
            if (pathname !== "/api/deepseek") {
              return next()
            }
            if (req.method !== "POST") {
              const r = res as ServerResponse
              r.statusCode = 405
              r.setHeader("Content-Type", "application/json")
              r.end(JSON.stringify({ error: "Method not allowed" }))
              return
            }
            try {
              const body = await readJsonBody(req as IncomingMessage)
              const env = { ...process.env, ...loaded }
              const result = await forwardToDeepSeek(body, env)
              const r = res as ServerResponse
              r.setHeader("Content-Type", "application/json")
              if (!result.ok) {
                r.statusCode = result.status >= 400 ? result.status : 502
                r.end(JSON.stringify({ error: result.error }))
                return
              }
              r.statusCode = 200
              r.end(JSON.stringify(result.data))
            } catch {
              const r = res as ServerResponse
              r.statusCode = 500
              r.setHeader("Content-Type", "application/json")
              r.end(JSON.stringify({ error: "Internal server error" }))
            }
          })
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
