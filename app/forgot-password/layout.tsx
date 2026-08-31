import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Forgot password', description: 'Request a secure DreamPaisa password reset link.' };

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) { return children; }
