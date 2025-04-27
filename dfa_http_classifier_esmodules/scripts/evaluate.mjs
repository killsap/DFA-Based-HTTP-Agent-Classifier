#!/usr/bin/env node
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { classify } from '../src/dfa.js';

const dir = process.argv[2] || 'logs';
const files = (await readdir(dir)).filter(f => f.endsWith('.json'));

let TP=0,FP=0,TN=0,FN=0;
for (const f of files) {
  const obj = JSON.parse(await readFile(path.join(dir, f), 'utf8'));

  // Skip any log that isn’t a dataset entry
  if (!Array.isArray(obj.tokens) || (obj.label !== 'agent' && obj.label !== 'human')) {
    console.warn('Skipping', f, '(not a dataset entry)');
    continue;
  }

  const pred  = classify(obj.tokens);
  const truth = obj.label === 'agent';

  if (pred && truth) TP++;
  else if (pred && !truth) FP++;
  else if (!pred && truth) FN++;
  else TN++;
}

const total = TP+FP+TN+FN;
console.table({
  TP,FP,FN,TN,
  accuracy: (TP+TN)/total,
  precision: TP/(TP+FP||1),
  recall: TP/(TP+FN||1),
  f1: (TP?(2*TP)/(2*TP+FP+FN):0)
});
