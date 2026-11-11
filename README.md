# Polymarket & Kalshi Arbitrage MCP Server

[![MCP Compatible](https://img.shields.io/badge/MCP-2024--11--05%20%7C%202025--06--18-blue)](https://modelcontextprotocol.io)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#)
[![Free Tier](https://img.shields.io/badge/Free%20Tier-2%20Calls%2FDay-success)](https://agent-kiosk.vercel.app/mcp)
[![Unlimited Pass](https://img.shields.io/badge/Unlimited%20Pass-%241%20%2F%20%245-purple)](https://agent-kiosk.vercel.app/buy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> Real-time Polymarket, Kalshi & Manifold prediction market odds aggregator and cross-venue arbitrage spread scanner for Claude, Cursor, Codex & AI agents.

Looking for a **Polymarket MCP** or **Kalshi arbitrage MCP server**? `polymarket-kalshi-arb-mcp` gives Claude Desktop, Cursor, OpenAI Codex, and autonomous trading agents live probability spreads, order-book volume, and cross-exchange mispricing alerts across **Polymarket**, **Kalshi**, and **Manifold Markets** — with zero setup and zero npm dependencies.

---

## Why Use `polymarket-kalshi-arb-mcp`?

- **Cross-Venue Arbitrage Detection (`kalshi_polymarket_arb`)** — Scans matching contracts across Kalshi, Polymarket, and Manifold to surface probability spreads and implied arbitrage edges in real time.
- **Deep Polymarket Odds & Liquidity (`prediction_markets`)** — Pulls active Polymarket event probabilities, 24h volume, liquidity depth, and resolution rules by topic (`bitcoin`, `fed`, `elections`, `ai`, `tariffs`, etc.).
- **Zero Dependencies & Dual Transport** — Pure Node.js >=18 (`readline` + `fetch`) stdio binary OR zero-install Streamable-HTTP remote MCP.
- **2 Free Calls / Day Out of the Box** — Works immediately with **zero configuration** and **no API key required**.
- **Instant Unlimited Upgrade** — Need high-volume production calls? Grab an instant API key at **[https://agent-kiosk.vercel.app/buy](https://agent-kiosk.vercel.app/buy)** (**$1 Starter 7-Day Pass** or **$5 Pro 30-Day Pass**) or pay per request natively via **x402 (USDC on Base)**.

---

## Option 1: Zero-Install Remote MCP URL (Fastest)

Connect directly via **Streamable-HTTP MCP** without installing anything locally:

- **Free Tier (2 Free Calls/Day, Zero Config):**
  ```text
  https://agent-kiosk.vercel.app/mcp
  ```
- **Paid Unlimited URL (With Prepaid Pass Key):**
  ```text
  https://agent-kiosk.vercel.app/mcp?api_key=ak_live_YOUR_KEY_HERE
  ```

> **Get an Instant API Key in 10 Seconds:** **[https://agent-kiosk.vercel.app/buy](https://agent-kiosk.vercel.app/buy)**
> - **$1.00 USDC** — **7-Day Starter Pass** (Instant `ak_live_...` key)
> - **$5.00 USDC** — **30-Day Pro Pass** (Full unmasked datasets across all endpoints)

---

## Option 2: Local `npx` / Stdio Setup (Claude Desktop, Cursor, Codex)

This package is **pure Node.js >= 18** with **zero external npm dependencies**, exposing **only** the 2 focused tools for this workflow so your LLM context window stays lean.

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "polymarket-kalshi-arb-mcp": {
      "command": "npx",
      "args": ["-y", "github:ralf9090/polymarket-kalshi-arb-mcp"],
      "env": {
        "AGENT_KIOSK_API_KEY": ""
      }
    }
  }
}
```
*(Leave `AGENT_KIOSK_API_KEY` empty for **2 free calls/day**, or paste your `ak_live_...` key from [agent-kiosk.vercel.app/buy](https://agent-kiosk.vercel.app/buy) for unlimited access.)*

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "polymarket-kalshi-arb-mcp": {
      "command": "npx",
      "args": ["-y", "github:ralf9090/polymarket-kalshi-arb-mcp"],
      "env": {
        "AGENT_KIOSK_API_KEY": "ak_live_OPTIONAL_PASS_KEY"
      }
    }
  }
}
```

### OpenAI Codex CLI (`~/.codex/config.toml`)

```toml
[mcp_servers.polymarket_kalshi_arb_mcp]
command = "npx"
args = ["-y", "github:ralf9090/polymarket-kalshi-arb-mcp"]
env = { AGENT_KIOSK_API_KEY = "" }
```

### Run Directly via `git clone` + `node index.js`

```bash
git clone https://github.com/ralf9090/polymarket-kalshi-arb-mcp.git
cd polymarket-kalshi-arb-mcp
node index.js
```

---

## Included MCP Tools (2)

### `kalshi_polymarket_arb`
Unified Kalshi, Polymarket & Manifold Prediction Market Aggregator and Cross-Venue Probability Spread / Arbitrage Scanner ($0.015 USDC).

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `query` | `string` | **Yes** | Topic or event keyword to scan across Kalshi, Polymarket & Manifold (e.g., 'bitcoin', 'fed', 'ai') |
| `limit` | `number` | No | Max markets to return (1-25, default: 10) |
| `x_api_key` | `string` | No | Optional ak_live_... 30-day Prepaid API Pass key to unlock the full unmasked dataset |

### `prediction_markets`
Query live prediction market odds & real-money implied probabilities (%) from Polymarket and Manifold Markets for any crypto, macro-economic, political, or technology event.

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `query` | `string` | **Yes** | Event or topic to search (e.g., 'bitcoin', 'fed rate', 'AI', 'election') |
| `limit` | `number` | No | Number of markets to return (1-15, default: 5) |
| `x_api_key` | `string` | No | Optional ak_live_... 30-day Prepaid API Pass key to unlock the full unmasked dataset |


---

## Example Prompts

- "Scan Kalshi and Polymarket for Bitcoin and Fed rate cut arbitrage spreads right now."
- "What are the highest-volume Polymarket prediction markets on AI regulation and US macro?"
- "Compare Kalshi vs Polymarket implied probabilities on recession markets and flag spreads > 3%."

---

## Pricing & Rate Limits

| Tier | Cost | Quota | Setup |
| :--- | :--- | :--- | :--- |
| **Free Trial** | **$0** | **2 Free Calls / Day** | Zero config — works out of the box |
| **Starter Pass** | **$1 USDC** | **7 Days Unlimited** | Get `ak_live_...` at [agent-kiosk.vercel.app/buy](https://agent-kiosk.vercel.app/buy) |
| **Pro Pass** | **$5 USDC** | **30 Days Unlimited** | Get `ak_live_...` at [agent-kiosk.vercel.app/buy](https://agent-kiosk.vercel.app/buy) |
| **x402 Pay-Per-Call** | **$0.008–$0.10** | Unlimited autonomous | Pass `payment_signature` (Base USDC EIP-3009) |

---

## License

MIT © [ralf9090](https://github.com/ralf9090) — Powered by [Agent Kiosk](https://agent-kiosk.vercel.app) ([Upgrade / Buy API Key](https://agent-kiosk.vercel.app/buy)).
