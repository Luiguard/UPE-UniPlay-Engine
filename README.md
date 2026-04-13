<div align="center">
  <h1>🌌 UniPlay Engine</h1>
  <p><b>The Universal Multiplayer Blueprint for the Next Generation of Online Games.</b></p>
  <p><i>Zero-Latency Feel. Distributed Consensus. Cross-Platform Determinism.</i></p>

  <a href="https://github.com/uniplay/engine/issues"><img src="https://img.shields.io/github/issues/uniplay/engine.svg" alt="GitHub issues"></a>
  <a href="https://github.com/uniplay/engine/network"><img src="https://img.shields.io/github/forks/uniplay/engine.svg" alt="GitHub forks"></a>
  <a href="https://github.com/uniplay/engine/stargazers"><img src="https://img.shields.io/github/stars/uniplay/engine.svg" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</div>

---

> UniPlay Engine is a revolutionary distributed multiplayer framework that decentralizes game simulation. By treating game clients as worker nodes, utilizing a WebRTC/UDP transport layer, and resolving authority via a blazing-fast consensus engine, UniPlay unlocks serverless horizontal scaling for up to tens of thousands of concurrent players.

## 🚀 Key Features

- **🌐 Edge Node Geographic Routing:** Middle-node topology with Latency Matrices to balance ping equally amongst players.
- **🛡️ NetSync Shield Anti-Cheat:** Server is out of the hot path. 2-of-3 Node Consensus determines physics state, instantly detecting and punishing diverging hashes (cheaters).
- **🧮 Absolute Determinism:** Custom `FixedPoint` math library yielding identical physics outputs across ARM/x86 architectures.
- **⚡ UDP Binary Serialization:** Zero Head-of-Line blocking. Epsilon-Delta State Compression drops bandwidth by up to 95%.
- **🚀 High-Availability (Redis):** Tolerates hard Kubernetes Pod evictions scaling with zero data loss.
- **🔌 Proxy Adapters (DMA/Packet Mux):** Turn legacy single-player and non-moddable games into multiplayer masterclasses via Memory Hook injection or local Packet translation.
- **📊 OpenTelemetry Out-of-the-Box:** Telemetry endpoints pre-configured for Grafana visualizations.

---

## 📦 Packages Overview

This monorepo is managed with Turborepo and pnpm workspaces:

| Package | Description |
|---|---|
| [`@uniplay/core`](./packages/core) | Shared Types, Fixed-Point Math, Typesafe Protocol Definitions |
| [`@uniplay/server`](./packages/server) | State Anchor, Consensus Engine, Edge Routing & Redis integration |
| [`@uniplay/client`](./packages/client) | Client Prediction, Input Buffering, Visual Smoothing (Interpolation) |
| [`@uniplay/proxy`](./packages/proxy) | Network & DMA Memory Adapters for extending unsupported game engines |
| [`@uniplay/cli`](./packages/cli) | Developer toolchain `uniplay create`, `uniplay proxy attach`, etc. |

---

## ⚡ Quick Start

### 1. Installation

Install the UniPlay CLI globally via NPM to start scaffolding your projects instantly.

```bash
npm install -g @uniplay/cli
```

### 2. Scaffold a new Multiplayer Server

```bash
uniplay create my-game-server --template sandbox
cd my-game-server
npm install
npm run dev
```

### 3. Connect a Game Client

UniPlay Engine works seamlessly with JavaScript frontends. If you are using Unity or Unreal Engine, we recommend checking our C# and C++ WebSocket/UDP Adapter references.

```typescript
import { UniPlayClient } from '@uniplay/client';

const client = new UniPlayClient("player_1", { 
    serverUrl: "ws://localhost:3000",
    prediction: true,
    reconciliation: 'smooth'
});

await client.connect();

// Send player input to global mesh!
client.sendInput({
    moveX: 1, moveY: 0, moveZ: 0,
    jump: true, sprint: false, action: false
});
```

---

## 🔌 Proxy Adapter (For Non-Moddable Games)

UniPlay isn't restricted to SDK integration. It comes with powerful external proxying techniques.

To hook into the memory of an existing process and map UniPlay's State Consensus directly into its Virtual Address Space:
```bash
# Finds PID and establishes Direct Memory Access bridges
uniplay proxy attach 4091 --protocol memory
```

---

## 🛠️ Development

We use `pnpm` and `turborepo` to develop the engine.

```bash
# Clone repo
git clone https://github.com/uniplay/engine.git
cd engine

# Install dependencies globally
pnpm install

# Build all packages simultaneously
pnpm run build

# Start watch mode
pnpm run dev
```

---

## 📄 License & Community

UniPlay Engine is open source software Apache-2.0 licensed.

- **Discord:** Join our [Community Chat](https://discord.gg/uniplay)
- **Twitter:** [@uniplaydev](https://twitter.com/uniplaydev)
- **Architecture Documentation:** Read our comprehensive Web Blueprint [here](#).

