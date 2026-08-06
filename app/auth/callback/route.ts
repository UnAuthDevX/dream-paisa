import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next');
  const destination = new URL(next?.startsWith('/') ? next : '/dashboard', request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(destination);
      if (destination.pathname === '/settings' && destination.searchParams.get('delete') === 'confirm') {
        response.cookies.set('dreampaisa-delete-verified', String(Date.now()), { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60, path: '/' });
      }
      if (destination.pathname === '/settings' && destination.searchParams.get('recover') === 'confirm') {
        response.cookies.set('dreampaisa-recovery-verified', String(Date.now()), { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60, path: '/' });
      }
      return response;
    }
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'We could not verify that link. Please request a new verification email.');
  return NextResponse.redirect(loginUrl);
}
