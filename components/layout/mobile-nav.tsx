"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Settings,
  LogOut,
  Plus,
  Heart,
  MessageSquare,
  ShoppingBag,
  Bell,
  Search,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";
import { LocalizedLink, useLocalizedRouter } from "../i18n/localized-link";
import { LanguageSwitcher } from "../i18n/language-switcher";

interface MobileNavProps {
  navigation: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function MobileNav({
  navigation,
  isOpen,
  onClose,
  className,
}: MobileNavProps) {
  const { t } = useTranslation(["common", "navigation"]);
  const router = useLocalizedRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<NavItem[]>(navigation);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  // Reset navigation state when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentLevel(navigation);
      setBreadcrumb([]);
    }
  }, [isOpen, navigation]);

  const handleNavigation = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      // Navigate to submenu
      setCurrentLevel(item.children);
      setBreadcrumb((prev) => [...prev, item.title]);
    } else {
      // Navigate to page and close menu
      if (item.href) {
        router.push(item.href);
        onClose();
      }
    }
  };

  const handleBack = () => {
    if (breadcrumb.length > 0) {
      // Go back to previous level
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);

      // Navigate back through the navigation tree
      let currentNav = navigation;
      for (const crumb of newBreadcrumb) {
        const item = currentNav.find((nav) => nav.title === crumb);
        if (item?.children) {
          currentNav = item.children;
        }
      }
      setCurrentLevel(currentNav);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const renderUserSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="p-4 space-y-3">
          <Button className="w-full" asChild>
            <LocalizedLink href="/auth/signin" onClick={onClose}>
              {t("navigation:sign_in")}
            </LocalizedLink>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <LocalizedLink href="/auth/signup" onClick={onClose}>
              {t("navigation:sign_up")}
            </LocalizedLink>
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <LocalizedLink href="/messages" onClick={onClose}>
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">Messages</span>
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                2
              </Badge>
            </LocalizedLink>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <LocalizedLink href="/favorites" onClick={onClose}>
              <Heart className="h-4 w-4 mr-1" />
              <span className="text-xs">Favorites</span>
            </LocalizedLink>
          </Button>

          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4 mr-1" />
            <span className="text-xs">Alerts</span>
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        </div>

        {/* User Menu Items */}
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <LocalizedLink href="/profile" onClick={onClose}>
              <User className="mr-3 h-4 w-4" />
              {t("navigation:profile")}
            </LocalizedLink>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <LocalizedLink href="/listings/my" onClick={onClose}>
              <ShoppingBag className="mr-3 h-4 w-4" />
              {t("navigation:my_listings")}
            </LocalizedLink>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <LocalizedLink href="/settings" onClick={onClose}>
              <Settings className="mr-3 h-4 w-4" />
              {t("navigation:settings")}
            </LocalizedLink>
          </Button>
        </div>
      </div>
    );
  };

  const renderNavigationHeader = () => {
    if (breadcrumb.length === 0) {
      return (
        <SheetHeader className="text-left p-4">
          <SheetTitle>{t("navigation:menu")}</SheetTitle>
        </SheetHeader>
      );
    }

    return (
      <div className="flex items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mr-2 p-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold">{breadcrumb[breadcrumb.length - 1]}</h2>
      </div>
    );
  };

  const renderNavigationItems = () => {
    return (
      <div className="px-4 pb-4">
        {currentLevel.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-between mb-1",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !item.disabled && handleNavigation(item)}
            disabled={item.disabled}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-3 h-4 w-4" />}
              <span>{item.title}</span>
            </div>
            {item.children && item.children.length > 0 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className={cn("w-80 p-0 flex flex-col", className)}
      >
        {/* Navigation Header */}
        {renderNavigationHeader()}

        <Separator />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Create Listing Button */}
          {isAuthenticated && breadcrumb.length === 0 && (
            <div className="p-4">
              <Button className="w-full" asChild>
                <LocalizedLink href="/create-listing" onClick={onClose}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("navigation:sell")}
                </LocalizedLink>
              </Button>
            </div>
          )}

          {/* Navigation Items */}
          {renderNavigationItems()}

          {/* User Section - only show on main level */}
          {breadcrumb.length === 0 && (
            <>
              <Separator />
              {renderUserSection()}
            </>
          )}

          {/* Language Switcher - only show on main level */}
          {breadcrumb.length === 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t("navigation:language")}
                  </span>
                  <LanguageSwitcher variant="minimal" size="sm" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sign Out Button */}
        {isAuthenticated && breadcrumb.length === 0 && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                {t("navigation:sign_out")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
