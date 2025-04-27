export function extractTokens(request, lastTimestamp, ring) {
  const tokens = [];
  const h = k => request.headers?.[k.toLowerCase()] ?? null;

  if (/^(fetch|xmlhttprequest)$/i.test(h('x-requested-with'))) tokens.push('H1');
  if (/(bot|spider|crawler|headless)/i.test(h('user-agent')))  tokens.push('H2');
  if (!h('accept-language'))                                   tokens.push('H3');
  if ((h('sec-fetch-site')||'').toLowerCase()==='none')        tokens.push('H4');
  if (!h('cookie'))                                            tokens.push('C1');

  const now = Date.now();
  const delta = now - lastTimestamp;
  tokens.push(delta < 50 ? 'T1' : 'T2');

  ring.push(now);
  while (ring[0] < now - 1000) ring.shift();
  if (ring.length > 10) tokens.push('D1');

  return { tokens, now };
}
