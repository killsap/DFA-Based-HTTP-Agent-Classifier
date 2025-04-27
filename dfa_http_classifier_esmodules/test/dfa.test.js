import { classify } from '../src/dfa.js';

test('bot: UA + burst', () => {
  expect(classify(['H2', 'T1'])).toBe(true);
});

test('human: normal pacing', () => {
  expect(classify(['T2', 'T2'])).toBe(false);
});

test('bot: cookie-less & no accept-language', () => {
  expect(classify(['C1', 'H3'])).toBe(true);
});