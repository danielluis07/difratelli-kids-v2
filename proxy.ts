import { NextResponse, type NextRequest } from "next/server";
import catalog from "@/docs/content/catalog-proposal.json";

// Reject unknown catalog slugs before Cache Components starts streaming a 200.
// The static recovery page retains the shared storefront and catalog action.
export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const records = parts[0] === "produto" ? catalog.products : catalog.collections;
  let slug: string;
  try { slug = decodeURIComponent(parts[1] ?? ""); } catch { slug = ""; }
  if (parts.length === 2 && records.some((record) => record.slug === slug)) return NextResponse.next();
  if (parts[0] === "colecoes" && parts.length === 1) return NextResponse.next();
  const destination = request.nextUrl.clone();
  destination.pathname = "/404";
  destination.search = "";
  return NextResponse.rewrite(destination, { status: 404 });
}

export const config = { matcher: ["/produto/:path*", "/colecoes/:path*"] };
