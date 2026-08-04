"use client";

import { useAuth } from "@/hooks/use-auth";

interface SidebarUserMenuProps {
  collapsed: boolean;
}

/**
 * Renders the user avatar and name in the sidebar footer.
 */
export function SidebarUserMenu({ collapsed }: SidebarUserMenuProps): React.JSX.Element {
  const { user } = useAuth();

  return (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {user?.details.firstName?.[0]}
        {user?.details.lastName?.[0]}
      </div>

      {!collapsed && (
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium">
            {user?.details.firstName} {user?.details.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      )}
    </>
  );
}
