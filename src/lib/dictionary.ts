// src/lib/dictionary.ts
import { supabase } from "./supabase";
import { set as idbSet, get as idbGet, createStore } from "idb-keyval";

const db = createStore("rx-guide-db","kv");

export type DictEntry = { key_text: string; lang: string; text: string; needs_review?: boolean };

export async function getDict(key: string, lang: string) {
  const cacheKey = `dict:${key}:${lang}`;
  const cached = await idbGet(cacheKey, db);
  if (cached) return cached as string;

  const { data, error } = await supabase
    .from("dictionary")
    .select("text")
    .eq("key_text", key)
    .eq("lang", lang)
    .maybeSingle();
  if (error) throw error;

  const text = data?.text ?? "";
  await idbSet(cacheKey, text, db);
  return text;
}

export async function upsertDict(entry: DictEntry) {
  const { data, error } = await supabase
    .from("dictionary")
    .upsert({ 
      key_text: entry.key_text, 
      lang: entry.lang, 
      text: entry.text, 
      needs_review: !!entry.needs_review 
    }, { onConflict: "key_text,lang" })
    .select()
    .maybeSingle();
  if (error) throw error;
  // cache更新
  await idbSet(`dict:${entry.key_text}:${entry.lang}`, entry.text, db);
  return data;
}
