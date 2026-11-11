#!/usr/bin/env node
/**
 * Polymarket & Kalshi Arbitrage MCP Server (polymarket-kalshi-arb-mcp)
 * Zero-dependency MCP stdio proxy routing focused niche tools to https://agent-kiosk.vercel.app/mcp
 *
 * Free tier: 2 free calls/day out of the box (no API key needed).
 * Unlimited upgrade: https://agent-kiosk.vercel.app/buy ($1 7-Day Starter Pass / $5 30-Day Pro Pass)
 */
import readline from "node:readline";

const SERVER_NAME = "polymarket-kalshi-arb-mcp";
const SERVER_VERSION = "1.0.0";
const REMOTE_MCP_URL =
  process.env.AGENT_KIOSK_MCP_URL || "https://agent-kiosk.vercel.app/mcp";

const TOOLS = [
  {
    "name": "kalshi_polymarket_arb",
    "description": "Unified Kalshi, Polymarket & Manifold Prediction Market Aggregator and Cross-Venue Probability Spread / Arbitrage Scanner ($0.015 USDC).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Topic or event keyword to scan across Kalshi, Polymarket & Manifold (e.g., 'bitcoin', 'fed', 'ai')"
        },
        "limit": {
          "type": "number",
          "description": "Max markets to return (1-25, default: 10)"
        },
        "payment_signature": {
          "type": "string",
          "description": "Optional x402 v2/v1 Base64 or JSON EIP-3009 USDC payment signature to unlock the full unmasked dataset directly via MCP"
        },
        "x_api_key": {
          "type": "string",
          "description": "Optional ak_live_... 30-day Prepaid API Pass key to unlock the full unmasked dataset"
        }
      },
      "required": [
        "query"
      ]
    },
    "annotations": {
      "title": "Kalshi Polymarket Arb",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    }
  },
  {
    "name": "prediction_markets",
    "description": "Query live prediction market odds & real-money implied probabilities (%) from Polymarket and Manifold Markets for any crypto, macro-economic, political, or technology event.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Event or topic to search (e.g., 'bitcoin', 'fed rate', 'AI', 'election')"
        },
        "limit": {
          "type": "number",
          "description": "Number of markets to return (1-15, default: 5)"
        },
        "payment_signature": {
          "type": "string",
          "description": "Optional x402 v2/v1 Base64 or JSON EIP-3009 USDC payment signature to unlock the full unmasked dataset directly via MCP"
        },
        "x_api_key": {
          "type": "string",
          "description": "Optional ak_live_... 30-day Prepaid API Pass key to unlock the full unmasked dataset"
        }
      },
      "required": [
        "query"
      ]
    },
    "annotations": {
      "title": "Prediction Markets",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    }
  }
];
const ALLOWED_TOOLS = new Set(TOOLS.map((t) => t.name));

function sendRpc(payload) {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

async function forwardToolCall(id, params) {
  const toolName = params?.name;
  const rawArgs =
    params?.arguments && typeof params.arguments === "object"
      ? { ...params.arguments }
      : {};

  if (!toolName || !ALLOWED_TOOLS.has(toolName)) {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Unknown tool '${toolName}'. Available tools in ${SERVER_NAME}: ${Array.from(ALLOWED_TOOLS).join(", ")}`,
      },
    });
  }

  const apiKey = (
    rawArgs.x_api_key ||
    process.env.AGENT_KIOSK_API_KEY ||
    ""
  ).trim();

  if (apiKey && !rawArgs.x_api_key) {
    rawArgs.x_api_key = apiKey;
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": `${SERVER_NAME}/${SERVER_VERSION}`,
  };

  if (apiKey) {
    headers["X-API-KEY"] = apiKey;
  }
  if (rawArgs.payment_signature) {
    headers["PAYMENT-SIGNATURE"] = String(rawArgs.payment_signature);
  }

  try {
    const response = await fetch(REMOTE_MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: rawArgs,
        },
      }),
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (parsed && parsed.jsonrpc === "2.0") {
      parsed.id = id;
      return sendRpc(parsed);
    }

    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: {
        isError: !response.ok,
        content: [
          {
            type: "text",
            text: parsed ? JSON.stringify(parsed, null, 2) : text,
          },
        ],
      },
    });
  } catch (err) {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "UPSTREAM_CONNECTION_ERROR",
                message: err?.message || String(err),
                remote_mcp_url: REMOTE_MCP_URL,
                upgrade_url: "https://agent-kiosk.vercel.app/buy",
              },
              null,
              2
            ),
          },
        ],
      },
    });
  }
}

async function handleLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let rpc;
  try {
    rpc = JSON.parse(trimmed);
  } catch (err) {
    return sendRpc({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` },
    });
  }

  const { id, method, params } = rpc;

  if (method && method.startsWith("notifications/")) {
    return;
  }

  if (method === "initialize") {
    const requestedVersion = params?.protocolVersion;
    const supportedVersions = ["2024-11-05", "2025-03-26", "2025-06-18"];
    const protocolVersion = supportedVersions.includes(requestedVersion)
      ? requestedVersion
      : "2024-11-05";

    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion,
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION,
        },
      },
    });
  }

  if (method === "ping" || method === "logging/setLevel") {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: {},
    });
  }

  if (method === "tools/list") {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: {
        tools: TOOLS,
      },
    });
  }

  if (method === "resources/list") {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: { resources: [] },
    });
  }

  if (method === "resources/templates/list") {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: { resourceTemplates: [] },
    });
  }

  if (method === "prompts/list") {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      result: { prompts: [] },
    });
  }

  if (method === "tools/call") {
    return await forwardToolCall(id, params);
  }

  if (id !== undefined) {
    return sendRpc({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

let queue = Promise.resolve();
rl.on("line", (line) => {
  queue = queue.then(() => handleLine(line)).catch((err) => {
    sendRpc({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: err?.message || "Internal error" },
    });
  });
});
