import { LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, signOut } from "@/lib/auth-store";
import { useGuest, exitGuest } from "@/lib/guest-store";
import { toast } from "sonner";

export function UserMenu() {
  const { user } = useAuth();
  const guest = useGuest();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    exitGuest();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  };

  if (!user) {
    return (
      <button
        onClick={() => {
          exitGuest();
          navigate({ to: "/login" });
        }}
        aria-label="Sign in"
        className="px-3 h-9 rounded-full glass neon-border text-xs font-medium hover:text-cyan transition inline-flex items-center gap-2"
      >
        <UserIcon className="size-4 text-neon-purple" />
        {guest ? "Sign in" : "Sign in"}
      </button>
    );
  }

  const meta = (user.user_metadata ?? {}) as { avatar_url?: string; picture?: string; full_name?: string; name?: string };
  const avatar = meta.avatar_url || meta.picture;
  const name = meta.full_name || meta.name || user.email || "Account";
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="size-9 rounded-full glass flex items-center justify-center overflow-hidden hover:glow-cyan transition"
        >
          {avatar ? (
            <img src={avatar} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-sm font-semibold text-cyan">{initial}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass neon-border w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt={name} className="size-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{initial}</div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="size-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
