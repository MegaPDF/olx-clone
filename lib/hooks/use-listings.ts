// Listings data hook
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './use-auth';
import { useDebounce } from './use-debounce';
import type { 
  ListingCard, 
  ListingDetail, 
  ListingFilters, 
  PaginatedResponse,
  ApiPaginatedResponse 
} from '../types';

interface UseListingsOptions {
  filters?: ListingFilters;
  searchQuery?: string;
  pageSize?: number;
  enabled?: boolean;
}

export function useListings(options: UseListingsOptions = {}) {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: options.pageSize || 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const debouncedSearchQuery = useDebounce(options.searchQuery || '', 300);

  const fetchListings = async (page: number = 1, reset: boolean = false) => {
    if (options.enabled === false) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearchQuery && { q: debouncedSearchQuery }),
        ...(options.filters?.category && { category: options.filters.category }),
        ...(options.filters?.condition && { 
          condition: options.filters.condition.join(',') 
        }),
        ...(options.filters?.priceRange && {
          minPrice: options.filters.priceRange.min.toString(),
          maxPrice: options.filters.priceRange.max.toString()
        }),
        ...(options.filters?.location?.city && { 
          city: options.filters.location.city 
        }),
        ...(options.filters?.location?.radius && { 
          radius: options.filters.location.radius.toString() 
        })
      });

      const response = await fetch(`/api/listings?${params}`);
      const data: ApiPaginatedResponse<ListingCard> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch listings');
      }

      if (reset || page === 1) {
        setListings(data.data || []);
      } else {
        setListings(prev => [...prev, ...(data.data || [])]);
      }

      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchListings(1, true);
  }, [debouncedSearchQuery, JSON.stringify(options.filters)]);

  const loadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchListings(pagination.page + 1, false);
    }
  };

  const refresh = () => {
    fetchListings(1, true);
  };

  const hasListings = listings.length > 0;
  const isEmpty = !loading && !hasListings && !error;

  return {
    listings,
    loading,
    error,
    pagination,
    hasListings,
    isEmpty,
    loadMore,
    refresh
  };
}

// Hook for fetching a single listing
export function useListing(listingId: string | null) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/listings/${listingId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch listing');
        }

        setListing(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  return { listing, loading, error };
}

// Hook for user's own listings
export function useMyListings() {
  const { user, isAuthenticated } = useAuth();
  
  return useListings({
    enabled: isAuthenticated,
    filters: user ? { seller: user.id } : undefined
  });
}