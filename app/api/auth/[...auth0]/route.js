import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: 'openid profile email',
    },
  }),
  callback: handleCallback({
    afterCallback: (req, res, session) => {
      // Process custom claims from Auth0 
      session.user = res.user; 
      session.user.groups = res.user['https://lukariagroup.com/roles'];
      return session;
    },
  }),
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL,
  }),
});
