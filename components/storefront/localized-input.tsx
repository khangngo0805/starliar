"use client";

import type { InputHTMLAttributes } from "react";
import { useLanguage, type TranslationKey } from "./language-provider";

type LocalizedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
  placeholderKey: TranslationKey;
};

export function LocalizedInput({ placeholderKey, ...props }: LocalizedInputProps) {
  const { t } = useLanguage();
  return (
    <input
      {...props}
      aria-label={props["aria-label"] ?? t(placeholderKey)}
      placeholder={t(placeholderKey)}
    />
  );
}
