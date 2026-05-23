"use client";

import { useState } from "react";

type VariantDraft = { size: string; sku: string; stock: number };

export function ProductForm({ action, method = "POST" }: { action: string; method?: "POST" | "PATCH" }) {
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "M", sku: "", stock: 0 }]);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch(action, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: formData.get("slug"),
        name: formData.get("name"),
        description: formData.get("description"),
        priceVnd: Number(formData.get("priceVnd")),
        published: formData.get("published") === "on",
        media: String(formData.get("media")).split("\n").filter(Boolean),
        variants
      })
    });
    setMessage(response.ok ? "Saved" : "Could not save product");
  }

  return (
    <form action={submit} className="admin-form">
      <input name="slug" placeholder="slug" required />
      <input name="name" placeholder="name" required />
      <textarea name="description" placeholder="description" required />
      <input name="priceVnd" placeholder="price VND" required type="number" />
      <textarea name="media" placeholder="/media/placeholders/example.svg" required />
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
      {message ? <p>{message}</p> : null}
    </form>
  );
}
