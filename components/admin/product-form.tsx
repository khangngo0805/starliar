"use client";

import { useState } from "react";
import { normalizeProductMediaInput } from "@/lib/commerce/product-presentation";

type VariantDraft = { size: string; sku: string; stock: number };

export function ProductForm({ action, method = "POST" }: { action: string; method?: "POST" | "PATCH" }) {
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "M", sku: "", stock: 0 }]);
  const [media, setMedia] = useState(["/media/placeholders/nocturne-shirt.svg"]);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch(action, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: formData.get("slug"),
        name: formData.get("name"),
        category: formData.get("category"),
        description: formData.get("description"),
        priceVnd: Number(formData.get("priceVnd")),
        published: formData.get("published") === "on",
        media: normalizeProductMediaInput(media),
        variants
      })
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setMessage(response.ok ? "Saved" : result?.error ?? "Could not save product.");
  }

  return (
    <form action={submit} className="admin-form">
      <input name="slug" placeholder="slug" required />
      <input name="name" placeholder="name" required />
      <input name="category" placeholder="category" required />
      <textarea name="description" placeholder="description" required />
      <input name="priceVnd" placeholder="price VND" required type="number" />
      <div className="admin-media-manager">
        <div className="admin-form-label-row">
          <span>Images</span>
          <button type="button" onClick={() => setMedia((rows) => [...rows, ""])}>
            Add image
          </button>
        </div>
        {media.map((src, index) => (
          <div className="admin-media-row" key={index}>
            <span className="admin-media-preview" aria-hidden="true">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={src} />
              ) : null}
            </span>
            <input
              placeholder="/media/placeholders/nocturne-shirt.svg or https://..."
              required={index === 0}
              value={src}
              onChange={(event) =>
                setMedia((rows) => rows.map((row, rowIndex) => (rowIndex === index ? event.target.value : row)))
              }
            />
            <button
              aria-label="Remove image"
              disabled={media.length === 1}
              type="button"
              onClick={() => setMedia((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <label>
        <input name="published" type="checkbox" /> Published
      </label>
      {variants.map((variant, index) => (
        <div className="admin-form-row" key={index}>
          <input
            placeholder="size"
            value={variant.size}
            onChange={(event) =>
              setVariants((rows) =>
                rows.map((row, rowIndex) => (rowIndex === index ? { ...row, size: event.target.value } : row))
              )
            }
          />
          <input
            placeholder="sku"
            value={variant.sku}
            onChange={(event) =>
              setVariants((rows) =>
                rows.map((row, rowIndex) => (rowIndex === index ? { ...row, sku: event.target.value } : row))
              )
            }
          />
          <input
            placeholder="stock"
            type="number"
            value={variant.stock}
            onChange={(event) =>
              setVariants((rows) =>
                rows.map((row, rowIndex) =>
                  rowIndex === index ? { ...row, stock: Number(event.target.value) } : row
                )
              )
            }
          />
        </div>
      ))}
      <button type="button" onClick={() => setVariants((rows) => [...rows, { size: "", sku: "", stock: 0 }])}>
        Add size
      </button>
      <button className="primary-button" type="submit">
        Save product
      </button>
      {message ? <p className={message === "Saved" ? undefined : "form-error"}>{message}</p> : null}
    </form>
  );
}
