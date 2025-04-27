#!/usr/bin/env node
// Generate synthetic request token traces.
// Usage: node scripts/generateDataset.mjs [outDir] [count]
import { mkdir, writeFile, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const outDir = process.argv[2] || 'logs';
const TOTAL = parseInt(process.argv[3] || '100', 10);
const AGENTS = TOTAL / 2;

if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

// purge existing json files
for (const f of await readdir(outDir)) {
  if (f.endsWith('.json')) await unlink(path.join(outDir, f));
}

const botTokens = ['H1','H2','H3','H4','T1','C1','D1'];
const nonBotTokens = ['T2'];
function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

for (let i = 0; i < TOTAL; i++) {
  const isAgent = i >= TOTAL - AGENTS;
  const label = isAgent ? 'agent' : 'human';
  const len = 5 + Math.floor(Math.random()*11); // 5–15 tokens
  const tokens = [];

  while (tokens.length < len) {
    if (isAgent) {
      const botSeen = tokens.filter(t => botTokens.includes(t)).length;
      const pool = botSeen < 2 ? botTokens : botTokens.concat(nonBotTokens);
      tokens.push(rand(pool));
    } else {
      const pool = Math.random() < 0.15 ? botTokens : nonBotTokens;
      tokens.push(rand(pool));
    }
  }

  const fileName = String(i+1).padStart(4, '0') + '_' + label + '.json';
  await writeFile(path.join(outDir, fileName),
    JSON.stringify({ tokens, label }, null, 2));
}

console.log(`Generated ${TOTAL} traces → ${path.resolve(outDir)}`);