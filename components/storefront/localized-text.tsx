"use client";

import { useLanguage, type TranslationKey } from "./language-provider";

export function LocalizedText({ textKey }: { textKey: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(textKey)}</>;
}
