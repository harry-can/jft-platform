
import { redirect } from "next/navigation";

export default async function CategoryShortcutPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const map: Record<string, string> = {
    vocab: "VOCAB",
    vocabulary: "VOCAB",
    grammar: "GRAMMAR",
    kanji: "KANJI",
    reading: "READING",
    listening: "LISTENING",
    info: "INFO",
    speaking: "SPEAKING",
  };

  const resolved = map[category.toLowerCase()] || category.toUpperCase();

  redirect(`/test-engine?mode=CATEGORY&category=${resolved}`);
}
