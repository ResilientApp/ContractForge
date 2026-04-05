import type { VercelRequest, VercelResponse } from "@vercel/node";
import { forwardToDeepSeek } from "../server/deepseekForward";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: unknown = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body) as unknown;
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const result = await forwardToDeepSeek(body);
  if (!result.ok) {
    return res.status(result.status >= 400 ? result.status : 502).json({
      error: result.error,
    });
  }

  return res.status(200).json(result.data);
}
