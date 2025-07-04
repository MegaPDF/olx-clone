"use client";

import { useState, createContext, useContext } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";
import { LocalizedLink } from "../i18n/localized-link";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProps {
  navigation: NavItem[];
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  variant?: "default" | "admin" | "floating";
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({
  navigation,
  defaultCollapsed = false,
  collapsible = true,
  variant = "default",
  className,
  children,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const contextValue: SidebarContextType = {
    isCollapsed,
    setIsCollapsed,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          variant === "floating" && "m-4 rounded-lg border shadow-lg",
          variant === "admin" && "bg-muted/50",
          className
        )}
      >
        <SidebarHeader />
        <SidebarContent navigation={navigation} />
        {children}
        {collapsible && <SidebarFooter />}
      </aside>
    </SidebarContext.Provider>
  );
}

function SidebarHeader() {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-16 items-center border-b px-4">
      <LocalizedLink href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold">M</span>
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl">
            {t("site_name", "Marketplace")}
          </span>
        )}
      </LocalizedLink>
    </div>
  );
}

function SidebarContent({ navigation }: { navigation: NavItem[] }) {
  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>
    </ScrollArea>
  );
}

function SidebarNavItem({
  item,
  level = 0,
}: {
  item: NavItem;
  level?: number;
}) {
  const { isCollapsed } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              level > 0 && "ml-4 w-auto",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={item.disabled}
          >
            <div className="flex items-center flex-1">
              {item.icon && (
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              )}
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                </>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {!isCollapsed && (
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => (
              <SidebarNavItem key={child.href} item={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        level > 0 && "ml-4 w-auto",
        item.disabled && "opacity-50 cursor-not-allowed"
      )}
      disabled={item.disabled}
      asChild={!item.disabled}
    >
      <LocalizedLink href={item.href || "#"}>
        <div className="flex items-center flex-1">
          {item.icon && (
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          )}
          {!isCollapsed && (
            <span className="flex-1 text-left">{item.title}</span>
          )}
        </div>
      </LocalizedLink>
    </Button>
  );
}

function SidebarFooter() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <div className="border-t p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full"
        title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("collapse")}
          </>
        )}
      </Button>
    </div>
  );
}

// Hook to use sidebar context
function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a Sidebar");
  }
  return context;
}

// Admin sidebar with predefined navigation
export function AdminSidebar({ className }: { className?: string }) {
  const { t } = useTranslation(["admin", "navigation"]);

  const adminNavigation: NavItem[] = [
    {
      title: t("navigation:dashboard"),
      href: "/admin",
      icon: Home,
    },
    {
      title: t("navigation:users"),
      href: "/admin/users",
      icon: Settings,
    },
    {
      title: t("navigation:listings"),
      href: "/admin/listings",
      icon: Settings,
    },
    {
      title: t("navigation:categories"),
      href: "/admin/categories",
      icon: Settings,
    },
    {
      title: t("navigation:reports"),
      href: "/admin/reports",
      icon: Settings,
    },
    {
      title: t("navigation:settings"),
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar
      navigation={adminNavigation}
      variant="admin"
      className={className}
    />
  );
}

// Dashboard sidebar for regular users
export function DashboardSidebar({ className }: { className?: string }) {
  const { t } = useTranslation("navigation");

  const dashboardNavigation: NavItem[] = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t("my_listings"),
      href: "/listings/my",
      icon: Settings,
    },
    {
      title: t("messages"),
      href: "/messages",
      icon: Settings,
    },
    {
      title: t("favorites"),
      href: "/favorites",
      icon: Settings,
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: Settings,
      children: [
        {
          title: t("profile"),
          href: "/settings/profile",
        },
        {
          title: t("account"),
          href: "/settings/account",
        },
        {
          title: t("privacy"),
          href: "/settings/privacy",
        },
        {
          title: t("notifications"),
          href: "/settings/notifications",
        },
      ],
    },
    {
      title: t("help"),
      href: "/help",
      icon: HelpCircle,
    },
  ];

  return <Sidebar navigation={dashboardNavigation} className={className} />;
}

// Mobile sidebar sheet
interface MobileSidebarProps {
  navigation: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function MobileSidebar({
  navigation,
  isOpen,
  onClose,
  className,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background transform transition-transform",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <SidebarNavItem key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}

export { useSidebar };
