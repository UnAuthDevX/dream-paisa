import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-primary">
            DreamPaisa
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-sm font-medium hover:text-primary">
              Transactions
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
