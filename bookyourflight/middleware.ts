import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/resources(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/spec',
  '/api-doc',
  '/api/resources(.*)',
  '/reservations/success',
  '/api/webhooks/clerk',
  '/api/webhooks/stripe',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isAdminRoute(req)) {
    const userRole = sessionClaims?.metadata?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/error/403', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
