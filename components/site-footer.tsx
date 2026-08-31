import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} DreamPaisa. Personal finance tracking made simple.</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/features" className="hover:text-foreground">Features</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
