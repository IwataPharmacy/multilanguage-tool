import { createStore, get as idbGet, set as idbSet } from "idb-keyval";
import { supabase } from "./supabase";

const db = createStore("rx-view-db", "kv");

export async function getDictText(key_text: string, lang: string): Promise<string> {
  const cacheKey = `dict:${key_text}:${lang}`;
  const cached = await idbGet(cacheKey, db);
  if (typeof cached === "string") return cached;

  const { data, error } = await supabase
    .from("dictionary")
    .select("text")
    .eq("key_text", key_text)
    .eq("lang", lang)
    .maybeSingle();

  if (error) {
    console.warn("dict fetch error", error);
    return "";
  }

  const text = data?.text ?? "";
  await idbSet(cacheKey, text, db);
  return text;
}
