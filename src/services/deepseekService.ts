// DeepSeek calls go through /api/deepseek so the API key stays on the server (Vercel or Vite dev middleware).
import { fewShotPrompt } from "../Prompts/FewshotPrompts";

export interface JSONGenerationResult {
  syntaxJSON: {
    contract_name: string;
    arguments: string;
  };
  exampleJSON: {
    contract_name: string;
    arguments: string;
  };
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

async function postChatCompletions(body: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<ChatCompletionResponse> {
  const response = await fetch("/api/deepseek", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let data: (ChatCompletionResponse & { error?: string | { message?: string } }) | Record<
    string,
    unknown
  > = {};
  try {
    data = rawText ? (JSON.parse(rawText) as typeof data) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errField = data && typeof data === "object" && "error" in data ? data.error : undefined;
    const msg =
      typeof errField === "string"
        ? errField
        : typeof errField === "object" &&
            errField !== null &&
            "message" in errField &&
            typeof (errField as { message: unknown }).message === "string"
          ? (errField as { message: string }).message
          : rawText.trim().slice(0, 300) || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(msg);
  }

  return data;
}

export async function generateSmartContract(prompt: string): Promise<string> {
  try {
    const data = await postChatCompletions({
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are ContractForge, a helpful AI assistant specialized in smart contracts for ResilientDB. 

You can:
1. **Generate Solidity smart contracts** when users ask for contract creation
2. **Explain and discuss** smart contract concepts, security, and best practices
3. **Answer general questions** about blockchain, ResilientDB, and development
4. **Provide guidance** on contract deployment and testing

When generating contracts:
- Use proper Solidity syntax (>= 0.5.0)
- Include security best practices
- Add comprehensive error handling
- Emit events for state changes
- Implement proper access control
- Optimize for gas efficiency

For contract requests: Return clean, compilable Solidity code without markdown formatting.
For explanations and discussions: Respond conversationally and helpfully.`,
        },
        {
          role: "user",
          content: fewShotPrompt(prompt),
        },
      ],
    });

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from API");
    }

    let cleanedContent = content.trim();

    if (cleanedContent.startsWith("```solidity")) {
      cleanedContent = cleanedContent.replace(/^```solidity\n/, "").replace(/\n```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const pragmaIndex = cleanedContent.indexOf("pragma solidity");
    if (pragmaIndex > 0) {
      cleanedContent = cleanedContent.substring(pragmaIndex);
    }

    return cleanedContent;
  } catch (error) {
    console.error("Error generating smart contract:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message.includes("DEEPSEEK_API_KEY") ||
      message.includes("not configured on the server")
    ) {
      return `🔑 **API key not configured (server)**

The app calls DeepSeek through a secure **server route** (\`/api/deepseek\`). Configure the key there—not in the browser.

**Local development:** add to \`.env\` (same folder as \`package.json\`):

\`\`\`
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
\`\`\`

Restart \`npm run dev\`. Do **not** use \`VITE_DEEPSEEK_API_KEY\` for production; it would expose the key in client JavaScript.

**Vercel:** Project → Settings → Environment Variables → add \`DEEPSEEK_API_KEY\` (and optionally \`DEEPSEEK_BASE_URL\`, \`DEEPSEEK_MODEL\`).

Get a key: https://platform.deepseek.com/`;
    }

    return `❌ **Connection Error**

I'm having trouble reaching the AI service. This could be due to network issues, an invalid key on the server, or the API being temporarily unavailable.

**Error details:** ${message}

Please check your configuration and try again.`;
  }
}

export async function generateJSONFromSolidity(solidityCode: string): Promise<JSONGenerationResult> {
  const jsonPrompt = `
Generate JSON for this contract:

\`\`\`solidity
${solidityCode}
\`\`\`

Return EXACTLY:

===EXAMPLE_JSON===
{"contract_name":"ContractName","arguments":"\\"value1\\",\\"value2\\",123"}

Rules: contract_name from Solidity, arguments as comma-separated values, strings with escaped quotes, numbers without quotes.`;

  try {
    const data = await postChatCompletions({
      temperature: 0.1,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content:
            "You are a Solidity-to-ResilientDB JSON converter. Generate JSON configurations in the specified format.",
        },
        {
          role: "user",
          content: jsonPrompt,
        },
      ],
    });

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from API");
    }

    const exampleMatch = content.match(/===EXAMPLE_JSON===\n([\s\S]*?)(?=\n|$)/);

    if (!exampleMatch) {
      console.error("Full AI Response:", content);
      throw new Error("Invalid response format: missing EXAMPLE_JSON section");
    }

    const exampleJSONStr = exampleMatch[1].trim();

    let cleanExampleJSON = exampleJSONStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    cleanExampleJSON = cleanExampleJSON.replace(/^\s*{\s*/, "{").replace(/\s*}\s*$/, "}");

    if (!exampleJSONStr.includes("}") || exampleJSONStr.length < 10) {
      console.error("Example JSON is incomplete:", exampleJSONStr);
      throw new Error("AI response incomplete: Example JSON section is not properly formatted");
    }

    let exampleJSON: { contract_name?: string; arguments?: string };
    try {
      exampleJSON = JSON.parse(cleanExampleJSON) as { contract_name?: string; arguments?: string };
    } catch (parseError) {
      console.error("JSON Parse Error - Example:", cleanExampleJSON);

      try {
        const fixedExample = cleanExampleJSON.replace(/,(\s*[}\]])/g, "$1");
        exampleJSON = JSON.parse(fixedExample) as { contract_name?: string; arguments?: string };
      } catch {
        throw new Error(
          `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        );
      }
    }

    if (!exampleJSON.contract_name || typeof exampleJSON.arguments !== "string") {
      throw new Error("Invalid EXAMPLE_JSON structure");
    }

    return {
      syntaxJSON: exampleJSON as JSONGenerationResult["syntaxJSON"],
      exampleJSON: exampleJSON as JSONGenerationResult["exampleJSON"],
    };
  } catch (error) {
    console.error("Error generating JSON from Solidity:", error);

    if (error instanceof Error && error.message.includes("Invalid response format")) {
      throw new Error("Failed to parse AI response. Please try again.");
    }

    if (error instanceof Error && error.message.includes("JSON parsing failed")) {
      throw new Error(`JSON parsing failed: ${error.message}. Please try again.`);
    }

    if (
      error instanceof Error &&
      (error.message.includes("DEEPSEEK_API_KEY") ||
        error.message.includes("not configured on the server"))
    ) {
      throw new Error(
        "DeepSeek API key is not configured on the server. Add DEEPSEEK_API_KEY to .env (local) or Vercel environment variables.",
      );
    }

    throw new Error(`JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
