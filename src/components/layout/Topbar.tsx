import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTheme } from '@/lib/stores/themeStore';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { user, signOut, role } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <p className="text-sm font-medium">{user?.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {role}
        </span>
        <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </header>
  );
}
