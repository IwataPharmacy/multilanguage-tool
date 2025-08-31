export type Lang = "en" | "zh-CN" | "vi-VN" | "ne-NP" | "ko-KR" | "ja";
export type Item = {
  id: string;
  drugClass: string;
  timesPerDay: 1 | 2 | 3 | 4;
  days: number;
  notes: string[];
};
