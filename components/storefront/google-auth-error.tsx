"use client";

import { useLanguage, type TranslationKey } from "./language-provider";

const googleErrorKeys: Record<string, TranslationKey> = {
  configuration: "googleNotConfigured",
  exchange: "googleTokenExchange",
  state: "googleStateExpired",
  email: "googleEmailNotVerified",
  profile: "googleProfileFailed",
  failed: "googleSignInFailed"
};

export function GoogleAuthError({ code }: { code?: string }) {
  const { t } = useLanguage();
  const textKey = code ? googleErrorKeys[code] : null;
  return textKey ? <p className="form-error">{t(textKey)}</p> : null;
}
