/** Client-side Auth0 env (must use NEXT_PUBLIC_* so Next.js inlines them in the browser). */
export function isAuth0Configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN?.trim() &&
      process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID?.trim()
  );
}
