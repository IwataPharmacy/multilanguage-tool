import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "https://vrlkucncredgokpzynyv.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybGt1Y25jcmVkZ29rcHp5bnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTkxODIsImV4cCI6MjA3MjIzNTE4Mn0.U76ylEWGEzhxtQA3eMF2i01zBPQaU6NNEupnzQXHiGY";

export const supabase = createClient(url, key);
