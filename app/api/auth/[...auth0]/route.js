import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = async (req, { params }) => {
  const resolvedParams = await params;
  return handleAuth()(req, { params: resolvedParams });
};
