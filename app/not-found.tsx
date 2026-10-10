import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyContent } from "@/components/ui/empty";
import { copy } from "@/lib/catalog";
export default function NotFound() {
  return <main id="main-content" className="content-container recovery-page"><Empty><EmptyHeader><h1>{copy.errors.notFoundHeading}</h1><p>{copy.errors.notFoundBody}</p></EmptyHeader><EmptyContent><Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.errors.notFoundAction}</Button></EmptyContent></Empty></main>;
}
