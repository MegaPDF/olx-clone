// Geolocation hook
import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';

interface LocationState {
  coordinates: Coordinates | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    coordinates: null,
    address: null,
    loading: false,
    error: null
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setLocation(prev => ({ ...prev, coordinates }));

        // Reverse geocoding to get address
        try {
          const address = await reverseGeocode(coordinates);
          setLocation(prev => ({ ...prev, address, loading: false }));
        } catch (error) {
          setLocation(prev => ({ 
            ...prev, 
            loading: false,
            error: 'Failed to get address'
          }));
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocation(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  }, []);

  const reverseGeocode = async (coordinates: Coordinates): Promise<string> => {
    // This would use Google Maps API or similar service
    // For now, return a placeholder
    return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
  };

  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const toRad = (value: number): number => (value * Math.PI) / 180;

  return {
    ...location,
    getCurrentLocation,
    calculateDistance
  };
}
