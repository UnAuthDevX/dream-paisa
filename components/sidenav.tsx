import Link from 'next/link';
import { getVerifiedUser } from '@/lib/auth';
import { logout } from '@/app/auth-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import LogoLongLight from '../Asserts/logo long light.png';
import LogoLongDark from '../Asserts/logo long dark.png';

export async function NavSlide() {
  const user = await getVerifiedUser();
  return (
    <nav className="border-b bg-background w-fit h-full">
      <div className="container mx-auto px-4 py-3 flex flex-col items-center justify-between gap-3">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="text-xl font-bold text-primary">
            <Image src={LogoLongLight} alt='logo long' className='dark:hidden max-w-50'/>
            <Image src={LogoLongDark} alt='logo long' className='hidden dark:block max-w-50 ' />
          </Link>
            <div className="flex flex-col max-w-[65vw] gap-3 overflow-x-auto whitespace-nowrap">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-sm font-medium hover:text-primary">
              Transactions
            </Link>
            <Link href="/accounts" className="text-sm font-medium hover:text-primary">Accounts</Link>
            <Link href="/assets" className="text-sm font-medium hover:text-primary">Assets</Link>
            <Link href="/investments" className="text-sm font-medium hover:text-primary">Investments</Link>
            <Link href="/settings" className="text-sm font-medium hover:text-primary">Settings</Link>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-4">
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
