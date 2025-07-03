"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";
import { useToast } from "./toast-provider";
import type {
  ApiResponse,
  ApiPaginatedResponse,
  ListingCard,
  ListingDetail,
  ConversationDetail,
  UserProfile,
} from "@/lib/types";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except 408, 429
              if (
                error?.status >= 400 &&
                error?.status < 500 &&
                ![408, 429].includes(error.status)
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Custom hooks for API calls using React Query

// Listings queries
export function useListingsQuery(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["listings", params],
    queryFn: async (): Promise<ApiPaginatedResponse<ListingCard>> => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.search) searchParams.set("q", params.search);
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());

      const response = await fetch(`/api/listings?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
  });
}

export function useListingQuery(listingId: string | null) {
  return useQuery({
    queryKey: ["listing", listingId],
    queryFn: async (): Promise<ApiResponse<ListingDetail>> => {
      if (!listingId) throw new Error("Listing ID is required");

      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      return response.json();
    },
    enabled: !!listingId,
  });
}

// User queries
export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ["user", userId || "me"],
    queryFn: async (): Promise<ApiResponse<UserProfile>> => {
      const endpoint = userId ? `/api/users/${userId}` : "/api/users/profile";
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });
}

// Conversations queries
export function useConversationsQuery() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async (): Promise<
      ApiResponse<{ conversations: ConversationDetail[]; totalUnread: number }>
    > => {
      const response = await fetch("/api/messages/conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      return response.json();
    },
  });
}

// Mutations with toast notifications
export function useCreateListingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/listings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create listing");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Success",
        description: "Listing created successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateListingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      listingId,
      formData,
    }: {
      listingId: string;
      formData: FormData;
    }) => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update listing");
      }

      return response.json();
    },
    onSuccess: (_, { listingId }) => {
      // Invalidate specific listing and listings list
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      toast({
        title: "Success",
        description: "Listing updated successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteListingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete listing");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Success",
        description: "Listing deleted successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      action,
    }: {
      listingId: string;
      action: "add" | "remove";
    }) => {
      const method = action === "add" ? "POST" : "DELETE";
      const response = await fetch(`/api/listings/favorites/${listingId}`, {
        method,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update favorite");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate favorites and listings
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// Query key factories for better organization
export const queryKeys = {
  all: ["api"] as const,
  listings: () => [...queryKeys.all, "listings"] as const,
  listing: (id: string) => [...queryKeys.listings(), id] as const,
  listingsByCategory: (category: string) =>
    [...queryKeys.listings(), "category", category] as const,
  users: () => [...queryKeys.all, "users"] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  userProfile: () => [...queryKeys.users(), "profile"] as const,
  conversations: () => [...queryKeys.all, "conversations"] as const,
  conversation: (id: string) => [...queryKeys.conversations(), id] as const,
  favorites: () => [...queryKeys.all, "favorites"] as const,
} as const;
