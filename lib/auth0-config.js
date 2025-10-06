import { initAuth0 } from '@auth0/nextjs-auth0';

const auth0Config = {
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
  session: {
    rollingDuration: 60 * 60 * 24, // 24 hours
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
  },
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  // This ensures custom claims are included in the user object
  afterCallback: (req, res, session) => {
    console.log('Auth0 Config - After callback triggered');
    console.log('Session:', session);
    console.log('User:', session.user);
    
    // Log all user properties to see what's available
    if (session?.user) {
      console.log('User properties:', Object.keys(session.user));
      console.log('User groups:', session.user['https://lukaria.com/groups']);
      console.log('User roles:', session.user.roles);
      console.log('User groups (standard):', session.user.groups);
      console.log('App metadata:', session.user.app_metadata);
      console.log('User metadata:', session.user.user_metadata);
    } else {
      console.log('⚠️ No user found in session');
    }
    
    return session;
  },
};

export default initAuth0(auth0Config);
