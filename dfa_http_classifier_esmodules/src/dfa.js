export const delta = {
  q0: { H1:'q1',H2:'q1',H3:'q1',H4:'q1',T1:'q1',C1:'q1',D1:'q1',T2:'q0' },
  q1: { H1:'qA',H2:'qA',H3:'qA',H4:'qA',T1:'qA',C1:'qA',D1:'qA',T2:'q1' },
  qA: { H1:'qA',H2:'qA',H3:'qA',H4:'qA',T1:'qA',C1:'qA',D1:'qA',T2:'qA' },
  qR: { H1:'qR',H2:'qR',H3:'qR',H4:'qR',T1:'qR',C1:'qR',D1:'qR',T2:'qR' }
};

export function classify(seq) {
  let s = 'q0';
  for (const t of seq) s = delta[s][t] ?? 'qR';
  return s === 'qA';
}