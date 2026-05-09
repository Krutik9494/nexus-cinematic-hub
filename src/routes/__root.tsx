import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { NexusAI } from "@/components/NexusAI";
import { CinematicBackground } from "@/components/CinematicBackground";
import { useAuth } from "@/lib/auth-store";
import { useGuest } from "@/lib/guest-store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10 neon-border">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This signal is lost in the void.</p>
        <Link to="/" className="mt-6 inline-block px-5 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
          Return Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-5 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0612" },
      { title: "NEXUS — Cinematic Universe" },
      { name: "description", content: "Discover, track, and rate favorite movies in a futuristic cinematic hub." },
      { property: "og:title", content: "NEXUS — Cinematic Universe" },
      { property: "og:description", content: "Discover, track, and rate favorite movies in a futuristic cinematic hub." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cinematic-stage-play.lovable.app/" },
      { property: "og:site_name", content: "NEXUS" },
      { property: "og:image", content: "https://cinematic-stage-play.lovable.app/og-square.jpg" },
      { property: "og:image:width", content: "600" },
      { property: "og:image:height", content: "600" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "NEXUS — Cinematic Universe" },
      { property: "og:image", content: "https://cinematic-stage-play.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1216" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "NEXUS — Cinematic Universe" },
      { property: "og:logo", content: "https://cinematic-stage-play.lovable.app/favicon-192.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NEXUS — Cinematic Universe" },
      { name: "twitter:description", content: "Discover, track, and rate favorite movies in a futuristic cinematic hub." },
      { name: "twitter:image", content: "https://cinematic-stage-play.lovable.app/og-square.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.has(location.pathname);
  const { user, loading } = useAuth();
  const guest = useGuest();

  useEffect(() => {
    if (loading) return;
    if (!user && !guest && !isPublic) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, guest, loading, isPublic, location.pathname, navigate]);

  if (isPublic) return <>{children}</>;
  if (loading) return null;
  if (!user && !guest) return null;
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAuthRoute = PUBLIC_ROUTES.has(location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative">
        <ClientOnly>
          <CinematicBackground />
        </ClientOnly>
        {!isAuthRoute && <Navbar />}
        <main className={isAuthRoute ? "relative" : "pt-16 relative"}>
          <ClientOnly>
            <AuthGate>
              <Outlet />
            </AuthGate>
          </ClientOnly>
        </main>
        <ClientOnly>
          <NexusAI />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "glass neon-border !bg-background/80 !text-foreground !border-cyan/40",
                title: "!text-foreground",
                description: "!text-muted-foreground",
              },
            }}
          />
        </ClientOnly>
      </div>
    </QueryClientProvider>
  );
}
