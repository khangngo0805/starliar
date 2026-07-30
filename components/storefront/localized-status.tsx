"use client";

import { statusTranslationKey, useLanguage } from "./language-provider";

export function LocalizedStatus({ status }: { status: string }) {
  const { t } = useLanguage();
  const textKey = statusTranslationKey(status);
  return <>{textKey ? t(textKey) : t("statusUnknown")}</>;
}
