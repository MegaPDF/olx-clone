"use client";

import { useState } from "react";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Menu,
  Plus,
  Bell,
  MessageSquare,
  Heart,
  User,
  Settings,
  LogOut,
  ShoppingBag,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";
import { LocalizedLink, useLocalizedRouter } from "../i18n/localized-link";
import { LanguageSwitcher } from "../i18n/language-switcher";

interface HeaderProps {
  navigation?: NavItem[];
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "marketplace";
}

const defaultNavigation: NavItem[] = [
  {
    title: "Browse",
    href: "/listings",
    children: [
      { title: "All Listings", href: "/listings" },
      { title: "Electronics", href: "/listings/electronics" },
      { title: "Vehicles", href: "/listings/vehicles" },
      { title: "Home & Garden", href: "/listings/home-garden" },
      { title: "Fashion", href: "/listings/fashion" },
    ],
  },
  {
    title: "Categories",
    href: "/categories",
  },
  {
    title: "Sell",
    href: "/create-listing",
  },
  {
    title: "Help",
    href: "/help",
  },
];

export function Header({
  navigation = defaultNavigation,
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  className,
  variant = "default",
}: HeaderProps) {
  const { t } = useTranslation(["common", "navigation"]);
  const router = useLocalizedRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const renderUserMenu = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <LocalizedLink href="/auth/signin">
              {t("navigation:sign_in")}
            </LocalizedLink>
          </Button>
          <Button asChild>
            <LocalizedLink href="/auth/signup">
              {t("navigation:sign_up")}
            </LocalizedLink>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        {showNotifications && (
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        )}

        {/* Messages */}
        <Button variant="ghost" size="sm" className="relative" asChild>
          <LocalizedLink href="/messages">
            <MessageSquare className="h-5 w-5" />
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              2
            </Badge>
          </LocalizedLink>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block">{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <LocalizedLink href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {t("navigation:profile")}
              </LocalizedLink>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <LocalizedLink href="/listings/my" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                {t("navigation:my_listings")}
              </LocalizedLink>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <LocalizedLink href="/favorites" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                {t("navigation:favorites")}
              </LocalizedLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <LocalizedLink href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                {t("navigation:settings")}
              </LocalizedLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("navigation:sign_out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderNavigation = () => {
    return (
      <nav className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => (
          <div key={item.href} className="relative group">
            {item.children ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <span>{item.title}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <LocalizedLink href={child.href}>
                        {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                        {child.title}
                      </LocalizedLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <LocalizedLink href={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </LocalizedLink>
              </Button>
            )}
          </div>
        ))}
      </nav>
    );
  };

  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <div
        className={cn(
          "flex-1 max-w-lg mx-4",
          variant === "minimal" && "max-w-xs"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSearch(formData.get("q") as string);
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder={t("navigation:search_placeholder")}
            className="pl-10 pr-4"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </form>
      </div>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("navigation:menu")}</span>
        </Button>

        {/* Logo */}
        <LocalizedLink href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">M</span>
          </div>
          <span className="hidden sm:block font-bold text-xl">
            {t("common:site_name", "Marketplace")}
          </span>
        </LocalizedLink>

        {/* Desktop Navigation */}
        {variant !== "minimal" && (
          <>
            <div className="flex-1 flex items-center justify-center">
              {renderNavigation()}
            </div>
          </>
        )}

        {/* Search Bar */}
        {renderSearchBar()}

        <div className="flex items-center space-x-3">
          {/* Create Listing Button */}
          {showCreateButton && isAuthenticated && (
            <Button asChild className="hidden sm:flex">
              <LocalizedLink href="/create-listing">
                <Plus className="mr-2 h-4 w-4" />
                {t("navigation:sell")}
              </LocalizedLink>
            </Button>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher variant="dropdown" size="sm" showLabel={false} />

          {/* User Menu */}
          {renderUserMenu()}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        navigation={navigation}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
