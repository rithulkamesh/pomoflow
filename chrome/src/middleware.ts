import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/pocketbase';

export function middleware(request: NextRequest) {
  const redirect_path = request.nextUrl + 'auth';

  const cookieStore = cookies();

  const { authStore } = createServerClient(cookieStore);

  if (!authStore.isValid) {
    return NextResponse.redirect(redirect_path);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|pomotimer.svg|auth|^$).*)',
  ],
};
