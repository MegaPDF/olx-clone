import { env } from '../env';
import type { Coordinates, Location } from '../types';

interface GeocodingResult {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
}

class GeocodingService {
  private apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      return data.results.map((result: any) => ({
        address: result.formatted_address,
        city: this.extractComponent(result.address_components, 'locality') || 
              this.extractComponent(result.address_components, 'administrative_area_level_2') || '',
        state: this.extractComponent(result.address_components, 'administrative_area_level_1') || '',
        country: this.extractComponent(result.address_components, 'country') || '',
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng
        }
      }));
    } catch (error) {
      throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }

      const result = data.results[0];

      return {
        address: result.formatted_address,
        city: this.extractComponent(result.address_components, 'locality') || 
              this.extractComponent(result.address_components, 'administrative_area_level_2') || '',
        state: this.extractComponent(result.address_components, 'administrative_area_level_1') || '',
        country: this.extractComponent(result.address_components, 'country') || '',
        coordinates
      };
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suggestions for address autocomplete
   */
  async getAddressSuggestions(input: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const encodedInput = encodeURIComponent(input);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK') {
        return [];
      }

      return data.predictions.map((prediction: any) => prediction.description);
    } catch (error) {
      console.error('Address suggestions failed:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
      Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if coordinates are within radius
   */
  isWithinRadius(
    center: Coordinates,
    point: Coordinates,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusKm;
  }

  /**
   * Extract component from Google Maps address components
   */
  private extractComponent(components: any[], type: string): string {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : '';
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const geocodingService = new GeocodingService();
