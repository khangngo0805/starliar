"use client";

import { useState } from "react";

export function CampaignForm() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/admin/campaign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        kind: formData.get("kind"),
        src: formData.get("src"),
        alt: formData.get("alt"),
        hero: formData.get("hero") === "on",
        position: Number(formData.get("position"))
      })
    });
    setMessage(response.ok ? "Saved" : "Could not save media");
  }

  return (
    <form action={submit} className="admin-form">
      <input name="title" placeholder="title" required />
      <select name="kind">
        <option value="video">Video</option>
        <option value="image">Image</option>
      </select>
      <input name="src" placeholder="/media/starliar-hero.mp4" required />
      <input name="alt" placeholder="alt text" required />
      <input defaultValue="0" min="0" name="position" required type="number" />
      <label>
        <input name="hero" type="checkbox" /> Hero media
      </label>
      <button className="primary-button" type="submit">
        Save campaign media
      </button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
