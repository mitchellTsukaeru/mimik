import { generateText } from 'ai';
import { getDefaultAIModel } from '@/core/capture/ai/models';
import { AI_LANGUAGES } from '@/core/capture/ai/prompts';
import { createModel } from '@/core/capture/ai/provider';

export interface TranslationSettings {
  apiKey: string;
  provider: string;
  model?: string;
  baseUrl?: string;
}

export interface TranslationItem {
  id: string;
  text: string;
}

export const TRANSLATION_BATCH_SIZE = 10;
const MAX_BATCH_CHARACTERS = 6_000;

export function getLanguageName(code: string): string {
  return AI_LANGUAGES.find((language) => language.code === code)?.label ?? code;
}

export function takeTranslationBatch(items: TranslationItem[], startIndex: number): TranslationItem[] {
  const batch: TranslationItem[] = [];
  let characters = 0;
  for (const item of items.slice(startIndex)) {
    if (batch.length >= TRANSLATION_BATCH_SIZE) break;
    if (batch.length > 0 && characters + item.text.length > MAX_BATCH_CHARACTERS) break;
    batch.push(item);
    characters += item.text.length;
  }
  return batch;
}

function parseTranslations(text: string, batch: TranslationItem[]): Record<string, string> {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const parsed = JSON.parse(cleaned) as { translations?: unknown };
  if (!Array.isArray(parsed.translations)) throw new Error('AI returned an invalid translation response');

  const expected = new Set(batch.map((item) => item.id));
  const translations: Record<string, string> = {};
  for (const entry of parsed.translations) {
    if (!entry || typeof entry !== 'object') continue;
    const id = (entry as { id?: unknown }).id;
    const translated = (entry as { text?: unknown }).text;
    if (typeof id !== 'string' || typeof translated !== 'string' || !expected.has(id)) continue;
    const value = translated.trim();
    if (value) translations[id] = value;
  }
  const missing = batch.find((item) => !translations[item.id]);
  if (missing) throw new Error('AI omitted part of the translation');
  return translations;
}

export async function translateBatch(
  batch: TranslationItem[],
  targetLanguage: string,
  settings: TranslationSettings,
): Promise<Record<string, string>> {
  const language = getLanguageName(targetLanguage);
  const prompt = `Translate each browser workflow instruction into ${language}. Preserve product names, button labels, field labels, URLs, code, placeholders, and quoted values when they should match the interface. Preserve the token {{INPUT_VALUE}} exactly wherever it appears. Keep the translation concise and instructional. Do not add explanations. Return strict JSON using exactly this shape: {"translations":[{"id":"same-id","text":"translated text"}]}.

Items:
${JSON.stringify(batch)}`;
  const { text } = await generateText({
    model: createModel(
      settings.provider,
      settings.model || getDefaultAIModel(settings.provider),
      settings.apiKey,
      settings.baseUrl,
    ),
    prompt,
    maxOutputTokens: Math.min(4_000, 300 + Math.ceil(batch.reduce((sum, item) => sum + item.text.length, 0) * 1.2)),
  });
  return parseTranslations(text, batch);
}
