import React, { useEffect, useMemo, useState } from "react";
import type { Item, Lang } from "./types";
import { getDictText } from "./lib/dictionary";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文（简体）" },
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "ne-NP", label: "नेपाली" },
  { code: "ko-KR", label: "한국어" },
  { code: "ja", label: "日本語" }
];

const DRUG_CLASSES = ["解熱鎮痛薬", "抗菌薬", "胃薬", "降圧薬", "抗アレルギー薬", "気管支拡張薬"];
const NOTE_TEMPLATES = [
  "食後に服用してください",
  "眠気に注意してください",
  "アルコールは控えてください",
  "抗菌薬は指示日数すべて服用してください",
  "妊娠・授乳中は医師に相談してください"
];

function speak(text: string, lang: Lang) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voices = speechSynthesis.getVoices();
  const v = voices.find(vv => vv.lang === lang) ?? voices.find(vv => vv.lang.startsWith(lang.split("-")[0]));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");
  const [items, setItems] = useState<Item[]>(() => JSON.parse(localStorage.getItem("items") || "[]"));

  useEffect(() => localStorage.setItem("lang", lang), [lang]);
  useEffect(() => localStorage.setItem("items", JSON.stringify(items)), [items]);

  // デモ追加
  const addDemo = () => {
    const item: Item = {
      id: crypto.randomUUID(),
      drugClass: DRUG_CLASSES[0],
      timesPerDay: 3,
      days: 5,
      notes: [NOTE_TEMPLATES[0], NOTE_TEMPLATES[1]]
    };
    setItems(prev => [item, ...prev]);
  };
  const clear = () => setItems([]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* ヘッダーは index.html 側 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
            <label>表示/音声の言語：
              <select value={lang} onChange={e => setLang(e.target.value as Lang)} style={{ marginLeft: 8 }}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
          </div>
          <div>
            <button className="primary" onClick={addDemo}>デモ項目を追加</button>
            <button onClick={clear} style={{ marginLeft: 8 }}>すべて削除</button>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>🌞朝 ☀昼 🌙夜 🌜寝る前</p>
      </div>

      <List items={items} lang={lang} onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))} />
    </div>
  );
}

function List({ items, lang, onDelete }: { items: Item[]; lang: Lang; onDelete: (id: string) => void; }) {
  if (!items.length) return <p id="empty" className="muted" style={{ padding: 16 }}>アイテムがありません。</p>;
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>指導リスト</h2>
      <div className="list">
        {items.map(it => <Card key={it.id} item={it} lang={lang} onDelete={onDelete} />)}
      </div>
    </div>
  );
}

function Card({ item, lang, onDelete }: { item: Item; lang: Lang; onDelete: (id: string) => void; }) {
  const [tDrug, setTDrug] = useState<string>("");
  const [tTimes, setTTimes] = useState<string>("");
  const [tDays, setTDays] = useState<string>("");

  useEffect(() => {
    getDictText("drug_class", item.drugClass, lang).then(t => setTDrug(t || "［未訳］"));
    getDictText("dosage_label", `${item.timesPerDay}回/日`, lang).then(t => setTTimes(t || "［未訳］"));
    getDictText("days_template", "for-days", lang).then(t => setTDays((t || "［未訳］").replace("{n}", String(item.days))));
  }, [item, lang]);

  const timeline = ["🌞", "☀", "🌙", "🌜"].slice(0, item.timesPerDay).join(" ");
  const notes = item.notes.length ? item.notes.join(" / ") : "—";

  // 音声読み上げ（シンプル英文生成。辞書で多言語にしたい場合はキー追加を）
  const speakText = `${tDrug}. ${tTimes}. ${tDays}. ${notes}`;

  return (
    <div className="item">
      <div>
        <span className="badge">{tDrug}</span>
        <span className="badge">{tTimes}</span>
        <span className="badge">{tDays}</span>
      </div>
      <div style={{ marginTop: 6 }}><b>服用タイミング:</b> {timeline}</div>
      <div style={{ marginTop: 6 }}><b>定型文:</b> {notes}</div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => speak(speakText, lang)}>▶ 音声</button>
        <button onClick={() => onDelete(item.id)}>削除</button>
      </div>
      <small className="muted">※ 未訳は Supabase の dictionary に追加してください（本スターターは閲覧専用）。</small>
    </div>
  );
}
