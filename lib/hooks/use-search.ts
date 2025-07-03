// Search functionality hook
import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from './use-debounce';
import type { SearchParams, ListingCard, ApiPaginatedResponse } from '../types';

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Get current search state from URL
  const currentSearch = useMemo((): SearchParams => ({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || undefined,
    location: {
      city: searchParams.get('city') || undefined,
      radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined
    },
    price: {
      min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    },
    condition: searchParams.get('condition')?.split(',') || undefined,
    sort: (searchParams.get('sort') as any) || 'relevance',
    order: (searchParams.get('order') as any) || 'desc'
  }), [searchParams]);

  const debouncedQuery = useDebounce(currentSearch.q, 300);

  // Update search parameters
  const updateSearch = useCallback((newParams: Partial<SearchParams>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else if (typeof value === 'object') {
        // Handle nested objects like location and price
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          const paramKey = key === 'location' ? nestedKey : `${key}${nestedKey.charAt(0).toUpperCase()}${nestedKey.slice(1)}`;
          if (nestedValue !== undefined && nestedValue !== null) {
            params.set(paramKey, nestedValue.toString());
          } else {
            params.delete(paramKey);
          }
        });
      } else {
        params.set(key, value.toString());
      }
    });

    // Reset page when search changes
    params.delete('page');
    
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push('/search');
  }, [router]);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/listings/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Auto-fetch suggestions when query changes
  useState(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      currentSearch.category ||
      currentSearch.location?.city ||
      currentSearch.price?.min ||
      currentSearch.price?.max ||
      currentSearch.condition?.length
    );
  }, [currentSearch]);

  return {
    currentSearch,
    suggestions,
    loadingSuggestions,
    hasActiveFilters,
    updateSearch,
    clearFilters,
    fetchSuggestions
  };
}
