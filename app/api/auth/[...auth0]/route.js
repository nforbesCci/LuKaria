import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0';

const auth0Handler = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: 'openid profile email',
    },
  }),
  callback: handleCallback({
    afterCallback: async (req, session) => {
      console.log('🔐 Auth Callback - Processing session');
      
      // Ensure user_metadata and app_metadata are included
      if (session?.user) {
        console.log('📋 Session user:', {
          sub: session.user.sub,
          email: session.user.email,
          name: session.user.name,
        });
        
        // Process custom claims from Auth0
        if (session.user['https://lukariagroup.com/roles']) {
          session.user.groups = session.user['https://lukariagroup.com/roles'];
          console.log('✅ Groups loaded:', session.user.groups);
        }
        
        // Check for user_metadata in custom claims
        if (session.user['https://lukariagroup.com/user_metadata']) {
          session.user.user_metadata = session.user['https://lukariagroup.com/user_metadata'];
          console.log('✅ user_metadata loaded from custom claims');
        } else if (session.user.user_metadata) {
          console.log('✅ user_metadata loaded directly');
        } else {
          console.log('⚠️ No user_metadata found in session');
        }
        
        // Check for app_metadata in custom claims
        if (session.user['https://lukariagroup.com/app_metadata']) {
          session.user.app_metadata = session.user['https://lukariagroup.com/app_metadata'];
          console.log('✅ app_metadata loaded from custom claims');
        } else if (session.user.app_metadata) {
          console.log('✅ app_metadata loaded directly');
        } else {
          console.log('⚠️ No app_metadata found in session');
        }
      }
      
      return session;
    },
  }),
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL,
  }),
});

export async function GET(request, context) {
  // Await params in Next.js 15
  const params = await context.params;
  return auth0Handler(request, { params });
}
