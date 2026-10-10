"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyContent } from "@/components/ui/empty";
import copy from "@/docs/content/copy-proposal.json";
export default function PageError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main id="main-content" className="content-container recovery-page"><Empty><EmptyHeader><h1>{copy.errors.pageHeading}</h1><p>{copy.errors.pageBody}</p></EmptyHeader><EmptyContent><Button onClick={retry}>{copy.errors.retryAction}</Button><Button nativeButton={false} role="link" variant="outline" render={<Link href="/" />}>{copy.errors.homeAction}</Button></EmptyContent></Empty></main>;
}
