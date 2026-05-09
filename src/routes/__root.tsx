import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { NexusAI } from "@/components/NexusAI";
import { CinematicBackground } from "@/components/CinematicBackground";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10 neon-border">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This signal is lost in the void.</p>
        <Link to="/" className="mt-6 inline-block px-5 py-2 rounded-md text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "var(--background)" }}>
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
      { title: "NEXUS — Your Personal Cinematic Universe" },
      { name: "description", content: "Discover, track, and rate your favorite movies in a futuristic cinematic experience." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative">
        <ClientOnly>
          <CinematicBackground />
        </ClientOnly>
        <Navbar />
        <main className="pt-16 relative">
          <Outlet />
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
