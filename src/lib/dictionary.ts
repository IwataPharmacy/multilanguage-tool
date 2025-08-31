
// src/lib/dictionary.ts（一例）
import { createStore, get as idbGet, set as idbSet } from "idb-keyval";
import { supabase } from "./supabase";
const db = createStore("rx-view-db","kv");

// domain を追加して検索
export async function getDictText(domain: string, key_text: string, lang: string): Promise<string> {
  const cacheKey = `dict:${domain}:${key_text}:${lang}`;
  const cached = await idbGet(cacheKey, db);
  if (typeof cached === "string") return cached;

  const { data, error } = await supabase
    .from("phrases")
    .select("id, translations:texts!inner(text, lang)")
    .eq("domain", domain)
    .eq("key_text", key_text)
    .eq("texts.lang", lang)           // ← join 別名はSupabase UIだと "translations" など
    .single();

  if (error) { console.warn(error); return ""; }

  const text = data?.translations?.[0]?.text ?? "";
  await idbSet(cacheKey, text, db);
  return text;
}
