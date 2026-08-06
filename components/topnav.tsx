import Link from 'next/link';
import { getVerifiedUser } from '@/lib/auth';
import { logout } from '@/app/auth-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import LogoLongLight from '../Asserts/logo long light.png';
import LogoLongDark from '../Asserts/logo long dark.png';

export async function NavTop() {
  const user = await getVerifiedUser();
  return (
    <nav className="border-b bg-background w-fit h-full">
        
    </nav>
    );
  }
