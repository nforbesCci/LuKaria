# LuKaria Auth0 Next.js App

A Next.js application with Auth0 authentication integration, featuring login/logout functionality and protected routes using the App Router.

## Features

- 🔐 Auth0 authentication with login/logout
- 🛡️ Protected routes for authenticated users
- 👤 User profile display with detailed information
- 📊 Interactive dashboard with stats and activity
- 🎨 Material-UI (MUI) design system for modern UI
- 📱 Fully responsive design for all devices
- ⚙️ Configuration management through environment variables
- 📦 Yarn package manager for fast, reliable dependency management
- ⚡ Next.js 15 App Router for modern routing
- 🚀 Server-side rendering and static generation
- ⚡ Turbopack for faster development builds
- 🔧 React 19 support and improved performance

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Auth0

1. Create a copy of the environment configuration file:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Auth0 configuration in the `.env.local` file:
   ```
   AUTH0_SECRET=your-long-random-secret-key
   AUTH0_BASE_URL=https://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

3. Generate a secret for AUTH0_SECRET:
   ```bash
   openssl rand -hex 32
   ```

4. In your Auth0 Dashboard:
   - Create a new Regular Web Application (not Single Page Application)
   - Add `https://localhost:3000/api/auth/callback` to the Allowed Callback URLs
   - Add `https://localhost:3000` to the Allowed Logout URLs
   - Add `https://localhost:3000` to the Allowed Web Origins

### 3. Run the Application

For development:
```bash
yarn dev
```

For production:
```bash
yarn build
yarn start
```

The application will open in your browser at `https://localhost:3000`.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Auth0 API routes
│   ├── dashboard/         # Dashboard page
│   ├── profile/           # Profile page
│   ├── layout.js          # Root layout component
│   ├── page.js            # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   └── Header.js          # Navigation header
├── middleware.js          # Next.js middleware for Auth0
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## Available Routes

- `/` - Home page (public)
- `/profile` - User profile page (protected)
- `/dashboard` - User dashboard (protected)

## Authentication Flow

1. **Unauthenticated users** see the login button on the home page
2. **Login** redirects to Auth0's hosted login page via `/api/auth/login`
3. **After authentication**, users are redirected back to the app via `/api/auth/callback`
4. **Authenticated users** can access protected routes and see their profile information
5. **Logout** clears the session via `/api/auth/logout` and redirects to the home page

## Configuration

The Auth0 configuration is managed through environment variables in `.env.local`. This allows for easy deployment across different environments without code changes.

## Dependencies

- `@auth0/nextjs-auth0` - Auth0 Next.js SDK (v3.8.0)
- `@mui/material` - Material-UI React components (v5.16.7)
- `@mui/icons-material` - Material-UI icons (v5.16.7)
- `@emotion/react` & `@emotion/styled` - CSS-in-JS styling (v11.13.x)
- `next` - Next.js framework (v15.0.3)
- `react` & `react-dom` - React framework (v18.3.1)

## Development

To start the development server:
```bash
yarn dev
```

To build for production:
```bash
yarn build
```

To start production server:
```bash
yarn start
```

## License

This project is open source and available under the [MIT License](LICENSE).
