// Favorites management hook
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { ListingCard } from '../types';

export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/listings/favorites');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch favorites');
      }

      const favoriteIds = data.data.map((item: any) => item._id);
      setFavorites(favoriteIds);
      setFavoriteListings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!isAuthenticated) return false;

    const isFavorited = favorites.includes(listingId);
    
    // Optimistic update
    setFavorites(prev => 
      isFavorited 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/listings/favorites/${listingId}`, {
        method
      });

      const data = await response.json();

      if (!data.success) {
        // Revert optimistic update
        setFavorites(prev => 
          isFavorited 
            ? [...prev, listingId]
            : prev.filter(id => id !== listingId)
        );
        throw new Error(data.error?.message || 'Failed to toggle favorite');
      }

      return !isFavorited;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      return isFavorited;
    }
  }, [isAuthenticated, favorites]);

  // Check if listing is favorited
  const isFavorited = useCallback((listingId: string) => {
    return favorites.includes(listingId);
  }, [favorites]);

  return {
    favorites,
    favoriteListings,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    refresh: fetchFavorites
  };
}