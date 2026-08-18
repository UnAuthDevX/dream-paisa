import Link from 'next/link';
import { getVerifiedUser } from '@/lib/auth';
import { logout } from '@/app/auth-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import LogoLongLight from '../Asserts/logo long light.png';
import LogoLongDark from '../Asserts/logo long dark.png';

export async function Navbar() {
  const user = await getVerifiedUser();
  return (
    <nav className="border-b bg-background w-full ">
      <div className="container mx-auto min-h-16 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-primary">
            <Image src={LogoLongLight} alt='logo long' className='dark:hidden max-w-50'/>
            <Image src={LogoLongDark} alt='logo long' className='hidden dark:block max-w-50 ' />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/about" className="text-sm font-medium hover:text-primary">About</Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">Contact</Link>
          <ThemeToggle />
          {user ? (
            <form action={logout}><button className="text-sm font-medium hover:text-primary" type="submit">Sign out</button></form>
          ) : <>
            <Link href="/login" className="text-sm font-medium hover:text-primary">Login</Link>
            {/* <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md">Sign Up</Link> */}
          </>}
        </div>
      </div>
    </nav>
    );
  }
