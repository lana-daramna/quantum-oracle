import test from 'node:test'; import assert from 'node:assert';
import { SimulatedQuantumEngine, PERSONALITIES, energyFor, moderate, classify, extractOptions, fallbackAnswer, parseGemini, askAI, decisionFor } from './server.js';

test('state is a 2-bit string mapped to a personality', () => { for (let i = 0; i < 50; i++) { const r = new SimulatedQuantumEngine().generateState(); assert.ok(PERSONALITIES[r.state]); } });
test('energy deterministic', () => assert.equal(energyFor('01', 2), energyFor('01', 2)));
test('moderation + topic', () => { assert.equal(moderate('hello'), 'approved'); assert.equal(moderate('porn'), 'hidden'); assert.equal(classify('what is a qubit'), 'Quantum Computing'); });

test('two-choice parsing (EN + AR)', () => {
  assert.deepEqual(extractOptions('Pizza or burger?'), { first: 'Pizza', second: 'burger' });
  assert.deepEqual(extractOptions('أختار frontend ولا backend؟'), { first: 'frontend', second: 'backend' });
  assert.equal(extractOptions('Should I learn quantum computing?'), null);
});
test('decision: 00/01 = YES, 10/11 = NO', () => { assert.equal(decisionFor('01'), 'YES'); assert.equal(decisionFor('10'), 'NO'); });

test('fallbackAnswer exists, picks the right side, matches language', () => {
  for (let i = 0; i < 20; i++) {
    assert.match(fallbackAnswer('Pizza or burger?', {}, '00'), /Pizza/);
    assert.match(fallbackAnswer('Pizza or burger?', {}, '11'), /burger/);
    assert.match(fallbackAnswer('أختار frontend ولا backend؟', {}, '01'), /frontend/);
    assert.match(fallbackAnswer('أختار frontend ولا backend؟', {}, '10'), /backend/);
    assert.match(fallbackAnswer('أتعلم الحوسبة الكمّية؟', {}, '10'), /[\u0600-\u06FF]/);
  }
});

test('parseGemini rejects truncated / empty answers and skips thought parts', () => {
  assert.equal(parseGemini({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'ال' }] } }] }), '');
  assert.equal(parseGemini({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'a' }] } }] }), '');
  assert.equal(parseGemini({}), '');
  assert.equal(parseGemini({ candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'thinking...' }, { text: 'Pizza. The qubits have spoken.' }] } }] }), 'Pizza. The qubits have spoken.');
});

test('askAI: falls back (never throws) on API error, truncation, network failure; uses answer when valid', async () => {
  const realFetch = globalThis.fetch; process.env.AI_API_KEY = 'test-key';
  try {
    globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: { message: 'bad' } }) });
    let r = await askAI('Pizza or burger?', PERSONALITIES['00'], 'COSMIC', '00'); assert.equal(r.fallback, true); assert.match(r.text, /Pizza/);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'Scrutinize' }] } }] }) });
    r = await askAI('Pizza or burger?', PERSONALITIES['11'], 'COSMIC', '11'); assert.equal(r.fallback, true); assert.match(r.text, /burger/);
    globalThis.fetch = async () => { throw new Error('network down'); };
    r = await askAI('أتعلم الحوسبة الكمّية؟', PERSONALITIES['01'], 'COSMIC', '01'); assert.equal(r.fallback, true);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Pizza wins. Cheese is quantum.' }] } }] }) });
    r = await askAI('Pizza or burger?', PERSONALITIES['00'], 'COSMIC', '00'); assert.equal(r.fallback, false); assert.equal(r.text, 'Pizza wins. Cheese is quantum.');
  } finally { globalThis.fetch = realFetch; delete process.env.AI_API_KEY; }
});
