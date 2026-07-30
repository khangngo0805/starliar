"use client";

import {
  categoryTranslationKey,
  useLanguage,
  type TranslationKey,
  type TranslationValues
} from "./language-provider";

export function LocalizedText({
  textKey,
  values
}: {
  textKey: TranslationKey;
  values?: TranslationValues;
}) {
  const { t } = useLanguage();
  return <>{t(textKey, values)}</>;
}

export function LocalizedProductCollectionText({
  category,
  collection
}: {
  category: string;
  collection: string;
}) {
  const { t } = useLanguage();
  const categoryKey = categoryTranslationKey(category);

  return (
    <>
      {t("productFromCollection", {
        category: categoryKey ? t(categoryKey) : category,
        collection
      })}
    </>
  );
}
