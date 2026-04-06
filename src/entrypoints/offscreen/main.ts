import { env, pipeline, type TokenClassificationPipeline } from '@huggingface/transformers';

const MODEL_ID = 'onnx-community/piiranha-v1-detect-personal-information-ONNX';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.useCustomCache = false;

const wasmPath = chrome.runtime.getURL('transformers/');
env.backends.onnx.wasm.wasmPaths = wasmPath;
env.backends.onnx.wasm.numThreads = 1;

let ner: TokenClassificationPipeline | null = null;
let activePort: chrome.runtime.Port | null = null;

async function initModel(): Promise<{ ok: boolean; error?: string }> {
  if (ner) return { ok: true };
  try {
    ner = (await pipeline('token-classification', MODEL_ID, {
      dtype: 'fp32',
      device: 'wasm',
      progress_callback: (progress: any) => {
        if (activePort && progress.status === 'progress') {
          activePort.postMessage({
            type: 'progress',
            file: progress.file,
            progress: Math.round(progress.progress),
          });
        }
      },
    })) as TokenClassificationPipeline;
    return { ok: true };
  } catch (err) {
    ner = null;
    return { ok: false, error: String(err) };
  }
}

interface TokenResult {
  word: string;
  entity: string;
  score: number;
  index: number;
  start: number;
  end: number;
}

interface Entity {
  text: string;
  label: string;
  score: number;
}

function postProcess(tokens: TokenResult[], originalText: string): Entity[] {
  const groups: { words: string[]; label: string; scores: number[]; lastIndex: number }[] = [];

  for (const token of tokens) {
    const label = token.entity.replace(/^[BI]-/, '');
    const isBegin = token.entity.startsWith('B-');
    const last = groups[groups.length - 1];

    if (!isBegin && last && last.label === label && token.index === last.lastIndex + 1) {
      last.words.push(token.word);
      last.scores.push(token.score);
      last.lastIndex = token.index;
    } else {
      groups.push({
        words: [token.word],
        label,
        scores: [token.score],
        lastIndex: token.index,
      });
    }
  }

  const entities: Entity[] = [];
  for (const group of groups) {
    const avgScore = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;
    if (avgScore < 0.8) continue;

    const text = group.words
      .map((w) => w.replace(/^##/, '').replace(/^▁/, ''))
      .join('')
      .trim();
    if (text.length <= 1) continue;

    if (originalText.includes(text)) {
      entities.push({ text, label: group.label, score: avgScore });
    } else {
      const spaced = group.words
        .map((w) => w.replace(/^##/, '').replace(/^▁/, ' '))
        .join('')
        .trim();
      if (originalText.includes(spaced)) {
        entities.push({ text: spaced, label: group.label, score: avgScore });
      }
    }
  }

  return entities;
}

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let offset = 0;
  while (offset < text.length) {
    chunks.push(text.slice(offset, offset + CHUNK_SIZE));
    offset += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

async function detect(text: string): Promise<{ entities: Entity[] }> {
  if (!ner) {
    const init = await initModel();
    if (!init.ok) return { entities: [] };
  }

  try {
    const chunks = chunkText(text);
    console.log('[OFFSCREEN] text length:', text.length, 'chunks:', chunks.length);
    const allEntities: Entity[] = [];
    const seen = new Set<string>();

    for (const chunk of chunks) {
      const results = await ner!(chunk, { ignore_labels: ['O'] });
      const tokens = (Array.isArray(results) ? results : [results]) as unknown as TokenResult[];
      console.log('[OFFSCREEN] raw tokens:', tokens.length, tokens.slice(0, 5));
      const processed = postProcess(tokens, text);
      console.log('[OFFSCREEN] processed entities:', processed.length, processed.slice(0, 5));
      for (const entity of processed) {
        const key = `${entity.text}:${entity.label}`;
        if (!seen.has(key)) {
          seen.add(key);
          allEntities.push(entity);
        }
      }
    }

    console.log('[OFFSCREEN] total entities:', allEntities.length, allEntities);
    return { entities: allEntities };
  } catch {
    return { entities: [] };
  }
}

const port = chrome.runtime.connect({ name: 'mimik-offscreen' });
activePort = port;
port.onMessage.addListener((msg) => {
  if (msg.type === 'offscreen:ai:init') {
    initModel().then((res) => port.postMessage({ id: msg.id, ...res }));
  }
  if (msg.type === 'offscreen:ai:detect') {
    detect(msg.text)
      .then((res) => {
        port.postMessage({
          type: 'log',
          message: `detect done: ${res.entities.length} entities, text length: ${(msg.text || '').length}`,
        });
        port.postMessage({ id: msg.id, ...res });
      })
      .catch((err) => {
        port.postMessage({ type: 'log', message: `detect error: ${err}` });
        port.postMessage({ id: msg.id, entities: [] });
      });
  }
});
