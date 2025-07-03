"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Search,
  X,
  Navigation,
  Map,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Coordinates } from "@/lib/types";

interface LocationValue {
  city?: string;
  radius?: number;
  coordinates?: Coordinates;
}

interface LocationSuggestion {
  id: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  type: "city" | "area" | "landmark";
}

interface LocationFilterProps {
  value?: LocationValue;
  onValueChange: (value: LocationValue | undefined) => void;
  variant?: "dropdown" | "form" | "compact";
  showRadius?: boolean;
  showMap?: boolean;
  maxRadius?: number;
  defaultRadius?: number;
  placeholder?: string;
  className?: string;
}

export function LocationFilter({
  value,
  onValueChange,
  variant = "dropdown",
  showRadius = true,
  showMap = false,
  maxRadius = 100,
  defaultRadius = 25,
  placeholder,
  className,
}: LocationFilterProps) {
  const { t } = useTranslation(["listings", "common"]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  // Fetch location suggestions
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(debouncedSearch)}`
        );
        const data = await response.json();

        if (data.success) {
          setSuggestions(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch location suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  // Update selected location based on value
  useEffect(() => {
    if (value?.city && !selectedLocation) {
      // Try to find matching location from suggestions
      const found = suggestions.find((s) => s.city === value.city);
      if (found) {
        setSelectedLocation(found);
      }
    }
  }, [value, suggestions, selectedLocation]);

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setSearchQuery(location.city);
    onValueChange({
      city: location.city,
      radius: value?.radius || defaultRadius,
      coordinates: location.coordinates,
    });
    setOpen(false);
  };

  const handleRadiusChange = (newRadius: number[]) => {
    onValueChange({
      ...value,
      radius: newRadius[0],
    });
  };

  const handleUseCurrentLocation = () => {
    if (!userLocation) return;

    onValueChange({
      city: t("listings:currentLocation"),
      radius: value?.radius || defaultRadius,
      coordinates: userLocation,
    });
    setSearchQuery(t("listings:currentLocation"));
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
    setSelectedLocation(null);
    setSearchQuery("");
  };

  const formatLocationName = (location: LocationSuggestion) => {
    return `${location.city}, ${location.state}`;
  };

  if (variant === "compact") {
    return (
      <Select
        value={value?.city || ""}
        onValueChange={(city) => {
          if (!city) {
            handleClear();
            return;
          }
          onValueChange({
            city,
            radius: defaultRadius,
          });
        }}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue
            placeholder={placeholder || t("listings:selectLocation")}
          />
        </SelectTrigger>
        <SelectContent>
          {suggestions.map((location) => (
            <SelectItem key={location.id} value={location.city}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{formatLocationName(location)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-2">
          <Label htmlFor="location-search">{t("listings:location")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              placeholder={placeholder || t("listings:enterLocation")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {value?.city && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Location suggestions */}
          {searchQuery && suggestions.length > 0 && (
            <Card className="max-h-40 overflow-y-auto">
              <CardContent className="p-2">
                {suggestions.map((location) => (
                  <Button
                    key={location.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium">{location.city}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.state}, {location.country}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current location button */}
          {userLocation && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {t("listings:useCurrentLocation")}
            </Button>
          )}
        </div>

        {/* Radius selector */}
        {showRadius && value?.city && (
          <div className="space-y-2">
            <Label>{t("listings:searchRadius")}</Label>
            <div className="px-2">
              <Slider
                value={[value.radius || defaultRadius]}
                onValueChange={handleRadiusChange}
                max={maxRadius}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1 km</span>
                <span className="font-medium">
                  {value.radius || defaultRadius} km
                </span>
                <span>{maxRadius} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Map preview */}
        {showMap && value?.coordinates && (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="mx-auto h-12 w-12 mb-2" />
              <p className="text-sm">{t("listings:mapPreview")}</p>
              <p className="text-xs">
                {value.city} • {value.radius}km {t("listings:radius")}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {value?.city ? (
              <div className="flex items-center gap-2">
                <span>{value.city}</span>
                {showRadius && value.radius && (
                  <Badge variant="secondary" className="text-xs">
                    {value.radius}km
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">
                {placeholder || t("listings:selectLocation")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {value?.city && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="bottom" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={placeholder || t("listings:searchLocations")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {loadingSuggestions
                ? t("common:loading")
                : t("listings:noLocationsFound")}
            </CommandEmpty>

            {userLocation && (
              <CommandGroup>
                <CommandItem onSelect={handleUseCurrentLocation}>
                  <Navigation className="mr-2 h-4 w-4" />
                  <span>{t("listings:useCurrentLocation")}</span>
                </CommandItem>
              </CommandGroup>
            )}

            {suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((location) => (
                  <CommandItem
                    key={location.id}
                    onSelect={() => handleLocationSelect(location)}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{location.city}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.state}, {location.country}
                      </div>
                    </div>
                    {value?.city === location.city && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        {/* Radius selector */}
        {showRadius && (value?.city || searchQuery) && (
          <div className="border-t p-3">
            <Label className="text-sm font-medium">
              {t("listings:searchRadius")}
            </Label>
            <div className="mt-2">
              <Slider
                value={[value?.radius || defaultRadius]}
                onValueChange={handleRadiusChange}
                max={maxRadius}
                min={1}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 km</span>
                <span className="font-medium">
                  {value?.radius || defaultRadius} km
                </span>
                <span>{maxRadius} km</span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
