#!/usr/bin/env node
// Compute accuracy metrics from logs/buttonInteractions.json
import { readFile } from 'fs/promises';
import path from 'path';

const file = path.join('logs', 'buttonInteractions.json');
let entries = [];
try {
  entries = JSON.parse(await readFile(file, 'utf8'));
} catch (e) {
  console.error('No interaction log file found at', file);
  process.exit(1);
}

let TP=0,FP=0,TN=0,FN=0, skipped=0;
for (const { action, verdict } of entries) {
  if (action === 'simulateHuman') {
    const truth = false;
    if (verdict && truth) TP++;
    else if (verdict && !truth) FP++;
    else if (!verdict && truth) FN++;
    else TN++;
  } else if (action === 'simulateBot') {
    const truth = true;
    if (verdict && truth) TP++;
    else if (verdict && !truth) FP++;
    else if (!verdict && truth) FN++;
    else TN++;
  } else if (action === 'liveUA') {
    const truth = true;
    if (verdict && truth) TP++;
    else if (verdict && !truth) FP++;
    else if (!verdict && truth) FN++;
    else TN++;
  } else {
    skipped++;
  }
}

const total = TP+FP+TN+FN;
if (!total) {
  console.log('No qualified records (simulateHuman/simulateBot) found.');
  process.exit(0);
}
console.table({
  TP,FP,FN,TN,
  accuracy:(TP+TN)/total,
  precision: TP/(TP+FP||1),
  recall: TP/(TP+FN||1),
  f1: TP? (2*TP)/(2*TP+FP+FN):0,
  skipped
});
