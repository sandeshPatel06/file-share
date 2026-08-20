import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/slugGenerator";
import db from "@/lib/db";

export default async function Home() {
  const newSlug = generateSlug();

  try {
    const existing = await db.prepare("SELECT slug FROM pages WHERE slug = ?").get(newSlug);
    if (!existing) {
      await db.prepare("INSERT INTO pages (slug, content, isProtected) VALUES (?, ?, 0)").run(newSlug, "");
    }
  } catch (err) {
    console.error("Auto-create space error on home page redirect:", err);
  }

  redirect(`/s/${newSlug}`);
}
