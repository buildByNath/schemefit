import { cookies } from "next/headers";
import en from "../dictionaries/en.json";
import hi from "../dictionaries/hi.json";
import ta from "../dictionaries/ta.json";

export type Locale = "en" | "hi" | "ta";

const dictionaries: Record<Locale, typeof en> = {
  en,
  hi: hi as typeof en,
  ta: ta as typeof en,
};

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  
  if (localeCookie && ["en", "hi", "ta"].includes(localeCookie.value)) {
    return localeCookie.value as Locale;
  }
  
  return "en"; // Default
}

export async function getDictionary() {
  const locale = await getLocale();
  return dictionaries[locale];
}
