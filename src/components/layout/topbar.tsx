"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/new": "New Invoice",
  "/contracts": "Contracts",
  "/contracts/new": "New Contract",
  "/clients": "Clients",
  "/clients/new": "New Client",
  "/expenses": "Expenses",
  "/expenses/new": "New Expense",
  "/settings": "Settings",
  "/settings/billing": "Billing",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/invoices/") && pathname.includes("/edit")) return "Edit Invoice";
  if (pathname.startsWith("/invoices/")) return "Invoice Details";
  if (pathname.startsWith("/clients/")) return "Client Details";
  if (pathname.startsWith("/contracts/")) return "Contract Details";
  return "FreelancePro";
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <Badge
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                variant="destructive"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b">
              <p className="font-semibold text-sm">Notifications</p>
            </div>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Invoice #INV-0012 overdue</p>
              <p className="text-xs text-muted-foreground">Due 3 days ago · Acme Corp</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Contract signed by client</p>
              <p className="text-xs text-muted-foreground">Web Design Contract · 1 hour ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Payment received</p>
              <p className="text-xs text-muted-foreground">$2,500 from TechStartup Inc · 2 hours ago</p>
            </DropdownMenuItem>
            <div className="border-t px-3 py-2">
              <p className="text-xs text-center text-muted-foreground cursor-pointer hover:text-foreground">
                View all notifications
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
