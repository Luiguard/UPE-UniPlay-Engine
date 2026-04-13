#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('uniplay')
  .description('UniPlay Engine CLI – The distributed multiplayer toolchain')
  .version('0.1.0');

// ═══════════════ CREATE ═══════════════
program
  .command('create <project-name>')
  .description('Scaffold a new UniPlay project with server and client entrypoints')
  .option('-t, --template <type>', 'Template type: sandbox | shooter | mmo', 'sandbox')
  .action(async (projectName: string, options: { template: string }) => {
    const targetDir = path.resolve(process.cwd(), projectName);
    console.log(`\n🚀 Creating UniPlay project: ${projectName} (template: ${options.template})`);

    if (await fs.pathExists(targetDir)) {
      console.error(`❌ Directory "${projectName}" already exists.`);
      process.exit(1);
    }

    await fs.mkdirp(path.join(targetDir, 'src'));

    await fs.writeJson(path.join(targetDir, 'package.json'), {
      name: projectName,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'npx tsx src/server.ts',
        build: 'tsc'
      },
      dependencies: {
        '@uniplay/core': 'latest',
        '@uniplay/server': 'latest',
        '@uniplay/client': 'latest'
      },
      devDependencies: {
        'typescript': '^5.5.0',
        'tsx': '^4.0.0'
      },
      author: 'Benjamin Leimer, Vienna',
      license: 'Apache-2.0'
    }, { spaces: 2 });

    await fs.writeJson(path.join(targetDir, 'tsconfig.json'), {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      },
      include: ['src/**/*']
    }, { spaces: 2 });

    const serverTemplate = `import { UniPlayServer } from '@uniplay/server';
import { MicrotaskType } from '@uniplay/core';

const server = new UniPlayServer({
  port: 3000,
  tickRate: 60,
  consensusQuorum: 2
});

// HostGateway API runs on port 3001 automatically.
// Your game engine can POST to /api/v1/entities to register entities.

server.tickController.onTick((tick, dt) => {
  // Your custom game loop logic here.
  // Example: Create and distribute physics tasks to connected worker nodes.
});

server.start();
console.log('UniPlay Server running on port 3000');
console.log('Host API running on port 3001');
`;

    await fs.writeFile(path.join(targetDir, 'src', 'server.ts'), serverTemplate);

    console.log(`\n✅ Project "${projectName}" created at ./${projectName}`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev`);
  });

// ═══════════════ EDGE ═══════════════
program
  .command('edge')
  .description('Start a UniPlay Edge Node (lightweight relay + consensus aggregator)')
  .option('-p, --port <number>', 'WebSocket port for worker connections', '8080')
  .option('-a, --anchor <url>', 'URL of the central State Anchor server', 'ws://localhost:3000')
  .option('-r, --region <string>', 'Geographic region identifier', 'local')
  .action(async (options) => {
    const port = parseInt(options.port, 10);
    console.log(`\n🌍 Starting UniPlay Edge Node`);
    console.log(`   Region:     ${options.region}`);
    console.log(`   Port:       ${port}`);
    console.log(`   Anchor:     ${options.anchor}`);

    // Dynamically import to avoid bundling issues in CLI-only usage
    try {
      const { UniPlayServer } = await import('@uniplay/server');

      const edge = new UniPlayServer({
        port,
        tickRate: 60,
        consensusQuorum: 2
      });

      edge.start();
      console.log(`\n✅ Edge Node running. Waiting for worker connections on port ${port}...`);
    } catch (e: any) {
      console.error(`\n❌ Failed to start Edge Node. Is @uniplay/server installed?`);
      console.error(`   Run: npm install @uniplay/server`);
      console.error(`   Error: ${e.message}`);
      process.exit(1);
    }
  });

// ═══════════════ PROXY ═══════════════
const proxyCmd = program.command('proxy').description('Proxy adapter commands for non-moddable games');

proxyCmd
  .command('listen <localPort>')
  .description('Start a TCP Packet Proxy listener (for network-based games)')
  .option('-s, --server <url>', 'UniPlay server URL', 'ws://localhost:3000')
  .action(async (localPort: string, options) => {
    const port = parseInt(localPort, 10);
    console.log(`\n🔌 Starting Packet Proxy on localhost:${port}`);
    console.log(`   UniPlay Server: ${options.server}`);

    try {
      const { UniPlayClient } = await import('@uniplay/client');
      const { PacketProxy } = await import('@uniplay/proxy');

      const client = new UniPlayClient('proxy_node', { serverUrl: options.server });
      const proxy = new PacketProxy(client, port);

      await client.connect();
      proxy.start();

      console.log(`\n✅ Packet Proxy active.`);
      console.log(`   Point your game client to localhost:${port} instead of the real server.`);
      console.log(`   Press Ctrl+C to stop.\n`);
    } catch (e: any) {
      console.error(`\n❌ Failed to start Packet Proxy.`);
      console.error(`   Ensure @uniplay/client and @uniplay/proxy are installed.`);
      console.error(`   Error: ${e.message}`);
      process.exit(1);
    }
  });

proxyCmd
  .command('info')
  .description('Show information about available proxy adapters')
  .action(() => {
    console.log(`\n📋 UniPlay Proxy Adapters\n`);
    console.log(`  PacketProxy (TCP Man-in-the-Middle)`);
    console.log(`    Usage: uniplay proxy listen 25566 --server ws://localhost:3000`);
    console.log(`    Games: Minecraft, Terraria, custom TCP-based servers\n`);
    console.log(`  MemoryHookProxy (Direct Memory Access)`);
    console.log(`    Usage: Subclass MemoryHookProxy in your own Node.js script`);
    console.log(`    Games: GTA, Skyrim, emulators (requires memoryjs or equivalent)\n`);
    console.log(`  For implementation examples, see: https://github.com/uniplay/engine/tree/main/examples`);
  });

program.parse();