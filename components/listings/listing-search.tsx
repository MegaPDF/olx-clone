"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  MapPin,
  Tag,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { SearchParams } from "@/lib/types";

interface SearchSuggestion {
  id: string;
  type: "query" | "category" | "location" | "listing";
  value: string;
  label: string;
  count?: number;
  icon?: any;
}

interface ListingSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  showTrendingSearches?: boolean;
  autoFocus?: boolean;
  loading?: boolean;
  className?: string;
}

export function ListingSearch({
  value,
  onValueChange,
  onSearch,
  placeholder,
  showSuggestions = true,
  showRecentSearches = true,
  showTrendingSearches = true,
  autoFocus = false,
  loading = false,
  className,
}: ListingSearchProps) {
  const { t } = useTranslation(["listings", "common"]);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(value, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // Load trending searches
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch("/api/search/trending");
        const data = await response.json();
        if (data.success) {
          setTrendingSearches(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending searches:", error);
      }
    };

    if (showTrendingSearches) {
      fetchTrendingSearches();
    }
  }, [showTrendingSearches]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!debouncedValue.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedValue)}`
        );
        const data = await response.json();

        if (data.success) {
          setSuggestions(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, showSuggestions]);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      10
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    saveRecentSearch(query);
    onSearch?.(query);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSearch(suggestions[selectedIndex].value);
    } else {
      handleSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focused) return;

    const totalItems = suggestions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case "Escape":
        setFocused(false);
        inputRef.current?.blur();
        break;
      case "Enter":
        e.preventDefault();
        handleSubmit(e);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onValueChange(suggestion.value);
    handleSearch(suggestion.value);
  };

  const showDropdown =
    focused &&
    (suggestions.length > 0 ||
      (value.length === 0 &&
        (recentSearches.length > 0 || trendingSearches.length > 0)));

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "category":
        return Tag;
      case "location":
        return MapPin;
      case "listing":
        return Star;
      default:
        return Search;
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder || t("listings:searchPlaceholder")}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-12"
            autoFocus={autoFocus}
          />

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onValueChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            <Command className="overflow-hidden">
              <CommandList className="max-h-96">
                {loadingSuggestions && value.length > 0 && (
                  <div className="p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 p-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Search suggestions */}
                {suggestions.length > 0 && (
                  <CommandGroup heading={t("listings:suggestions")}>
                    {suggestions.map((suggestion, index) => {
                      const Icon = getSuggestionIcon(suggestion.type);
                      return (
                        <CommandItem
                          key={suggestion.id}
                          onSelect={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            index === selectedIndex && "bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{suggestion.label}</span>
                          {suggestion.count && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.count}
                            </Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {/* Recent searches */}
                {value.length === 0 &&
                  recentSearches.length > 0 &&
                  showRecentSearches && (
                    <CommandGroup
                      heading={
                        <div className="flex items-center justify-between">
                          <span>{t("listings:recentSearches")}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={clearRecentSearches}
                          >
                            {t("common:clearAll")}
                          </Button>
                        </div>
                      }
                    >
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <CommandItem
                          key={search}
                          onSelect={() => {
                            onValueChange(search);
                            handleSearch(search);
                          }}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{search}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                {/* Trending searches */}
                {value.length === 0 &&
                  trendingSearches.length > 0 &&
                  showTrendingSearches && (
                    <CommandGroup heading={t("listings:trendingSearches")}>
                      {trendingSearches.slice(0, 5).map((search, index) => (
                        <CommandItem
                          key={search}
                          onSelect={() => {
                            onValueChange(search);
                            handleSearch(search);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{search}</span>
                          <Badge variant="outline" className="text-xs">
                            {t("common:trending")}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
