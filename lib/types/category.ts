import { LocalizedContent } from "./global";

// Category types
export interface CategoryDetail {
  id: string;
  name: LocalizedContent;
  slug: string;
  description?: LocalizedContent;
  icon?: string;
  image?: string;
  parent?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  listingCount: number;
  children?: CategoryDetail[];
  seo: {
    title?: LocalizedContent;
    description?: LocalizedContent;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategory {
  name: LocalizedContent;
  slug: string;
  description?: LocalizedContent;
  icon?: string;
  image?: string;
  parent?: string;
  sortOrder?: number;
  seo?: {
    title?: LocalizedContent;
    description?: LocalizedContent;
    keywords?: string[];
  };
}

export interface UpdateCategory extends Partial<CreateCategory> {
  id: string;
  isActive?: boolean;
}

export interface CategoryTree {
  id: string;
  name: LocalizedContent;
  slug: string;
  icon?: string;
  listingCount: number;
  children: CategoryTree[];
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  categoriesWithListings: number;
  topCategories: Array<{
    id: string;
    name: LocalizedContent;
    listingCount: number;
  }>;
}
