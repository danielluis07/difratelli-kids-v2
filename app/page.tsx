import { copy } from "@/lib/catalog";

export default function Home() {
  return (
    <main>
      <h1>{copy.editorial.hero.heading}</h1>
      <p>{copy.editorial.hero.support}</p>
    </main>
  );
}
