import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getVerifiedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    return null;
  }

  return user;
}

export async function requireVerifiedUser() {
  const user = await getVerifiedUser();

  if (!user) {
    redirect('/login?message=Please%20sign%20in%20and%20verify%20your%20email%20to%20continue.');
  }

  return user;
}
