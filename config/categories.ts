import type { CategoryDetail, LocalizedContent } from '../lib/types';

export interface DefaultCategory {
  name: LocalizedContent;
  slug: string;
  description?: LocalizedContent;
  icon: string;
  parent?: string;
  sortOrder: number;
  seo?: {
    title?: LocalizedContent;
    description?: LocalizedContent;
    keywords?: string[];
  };
  children?: DefaultCategory[];
}

export const defaultCategories: DefaultCategory[] = [
  {
    name: {
      en: 'Electronics',
      id: 'Elektronik'
    },
    slug: 'electronics',
    description: {
      en: 'Phones, computers, gadgets and electronic devices',
      id: 'Ponsel, komputer, gadget dan perangkat elektronik'
    },
    icon: 'smartphone',
    sortOrder: 1,
    seo: {
      title: {
        en: 'Electronics for Sale - Phones, Computers & More',
        id: 'Elektronik Dijual - Ponsel, Komputer & Lainnya'
      },
      description: {
        en: 'Find great deals on electronics including smartphones, laptops, tablets and more',
        id: 'Temukan penawaran terbaik untuk elektronik termasuk smartphone, laptop, tablet dan lainnya'
      },
      keywords: ['electronics', 'smartphone', 'laptop', 'computer', 'gadget']
    },
    children: [
      {
        name: { en: 'Mobile Phones', id: 'Ponsel' },
        slug: 'mobile-phones',
        icon: 'smartphone',
        sortOrder: 1
      },
      {
        name: { en: 'Computers & Laptops', id: 'Komputer & Laptop' },
        slug: 'computers-laptops',
        icon: 'laptop',
        sortOrder: 2
      },
      {
        name: { en: 'Tablets', id: 'Tablet' },
        slug: 'tablets',
        icon: 'tablet',
        sortOrder: 3
      },
      {
        name: { en: 'Audio & Headphones', id: 'Audio & Headphone' },
        slug: 'audio-headphones',
        icon: 'headphones',
        sortOrder: 4
      },
      {
        name: { en: 'Gaming', id: 'Gaming' },
        slug: 'gaming',
        icon: 'gamepad',
        sortOrder: 5
      }
    ]
  },
  {
    name: {
      en: 'Vehicles',
      id: 'Kendaraan'
    },
    slug: 'vehicles',
    description: {
      en: 'Cars, motorcycles, and other vehicles',
      id: 'Mobil, motor, dan kendaraan lainnya'
    },
    icon: 'car',
    sortOrder: 2,
    seo: {
      title: {
        en: 'Vehicles for Sale - Cars, Motorcycles & More',
        id: 'Kendaraan Dijual - Mobil, Motor & Lainnya'
      },
      description: {
        en: 'Buy and sell cars, motorcycles, and other vehicles in your area',
        id: 'Jual beli mobil, motor, dan kendaraan lainnya di daerah Anda'
      },
      keywords: ['vehicles', 'cars', 'motorcycles', 'automotive']
    },
    children: [
      {
        name: { en: 'Cars', id: 'Mobil' },
        slug: 'cars',
        icon: 'car',
        sortOrder: 1
      },
      {
        name: { en: 'Motorcycles', id: 'Motor' },
        slug: 'motorcycles',
        icon: 'bike',
        sortOrder: 2
      },
      {
        name: { en: 'Trucks & Commercial', id: 'Truk & Komersial' },
        slug: 'trucks-commercial',
        icon: 'truck',
        sortOrder: 3
      },
      {
        name: { en: 'Spare Parts', id: 'Suku Cadang' },
        slug: 'spare-parts',
        icon: 'settings',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Home & Garden',
      id: 'Rumah & Taman'
    },
    slug: 'home-garden',
    description: {
      en: 'Furniture, appliances, and home improvement items',
      id: 'Furnitur, peralatan rumah, dan barang perbaikan rumah'
    },
    icon: 'home',
    sortOrder: 3,
    children: [
      {
        name: { en: 'Furniture', id: 'Furnitur' },
        slug: 'furniture',
        icon: 'sofa',
        sortOrder: 1
      },
      {
        name: { en: 'Appliances', id: 'Peralatan Rumah' },
        slug: 'appliances',
        icon: 'refrigerator',
        sortOrder: 2
      },
      {
        name: { en: 'Garden & Outdoor', id: 'Taman & Outdoor' },
        slug: 'garden-outdoor',
        icon: 'flower',
        sortOrder: 3
      },
      {
        name: { en: 'Home Decor', id: 'Dekorasi Rumah' },
        slug: 'home-decor',
        icon: 'palette',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Fashion & Beauty',
      id: 'Fashion & Kecantikan'
    },
    slug: 'fashion-beauty',
    description: {
      en: 'Clothing, shoes, accessories, and beauty products',
      id: 'Pakaian, sepatu, aksesoris, dan produk kecantikan'
    },
    icon: 'shirt',
    sortOrder: 4,
    children: [
      {
        name: { en: 'Men\'s Fashion', id: 'Fashion Pria' },
        slug: 'mens-fashion',
        icon: 'shirt',
        sortOrder: 1
      },
      {
        name: { en: 'Women\'s Fashion', id: 'Fashion Wanita' },
        slug: 'womens-fashion',
        icon: 'dress',
        sortOrder: 2
      },
      {
        name: { en: 'Shoes', id: 'Sepatu' },
        slug: 'shoes',
        icon: 'shoe',
        sortOrder: 3
      },
      {
        name: { en: 'Accessories', id: 'Aksesoris' },
        slug: 'accessories',
        icon: 'watch',
        sortOrder: 4
      },
      {
        name: { en: 'Beauty & Health', id: 'Kecantikan & Kesehatan' },
        slug: 'beauty-health',
        icon: 'heart',
        sortOrder: 5
      }
    ]
  },
  {
    name: {
      en: 'Sports & Recreation',
      id: 'Olahraga & Rekreasi'
    },
    slug: 'sports-recreation',
    description: {
      en: 'Sports equipment, fitness gear, and recreational items',
      id: 'Peralatan olahraga, alat fitness, dan barang rekreasi'
    },
    icon: 'dumbbell',
    sortOrder: 5,
    children: [
      {
        name: { en: 'Fitness Equipment', id: 'Peralatan Fitness' },
        slug: 'fitness-equipment',
        icon: 'dumbbell',
        sortOrder: 1
      },
      {
        name: { en: 'Sports Gear', id: 'Peralatan Olahraga' },
        slug: 'sports-gear',
        icon: 'football',
        sortOrder: 2
      },
      {
        name: { en: 'Outdoor Recreation', id: 'Rekreasi Outdoor' },
        slug: 'outdoor-recreation',
        icon: 'mountain',
        sortOrder: 3
      },
      {
        name: { en: 'Bicycles', id: 'Sepeda' },
        slug: 'bicycles',
        icon: 'bike',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Books & Media',
      id: 'Buku & Media'
    },
    slug: 'books-media',
    description: {
      en: 'Books, magazines, movies, music, and educational materials',
      id: 'Buku, majalah, film, musik, dan materi edukasi'
    },
    icon: 'book',
    sortOrder: 6,
    children: [
      {
        name: { en: 'Books', id: 'Buku' },
        slug: 'books',
        icon: 'book',
        sortOrder: 1
      },
      {
        name: { en: 'Movies & TV', id: 'Film & TV' },
        slug: 'movies-tv',
        icon: 'film',
        sortOrder: 2
      },
      {
        name: { en: 'Music', id: 'Musik' },
        slug: 'music',
        icon: 'music',
        sortOrder: 3
      },
      {
        name: { en: 'Educational', id: 'Edukasi' },
        slug: 'educational',
        icon: 'graduation-cap',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Services',
      id: 'Jasa'
    },
    slug: 'services',
    description: {
      en: 'Professional services, repairs, and personal services',
      id: 'Jasa profesional, perbaikan, dan jasa personal'
    },
    icon: 'wrench',
    sortOrder: 7,
    children: [
      {
        name: { en: 'Home Services', id: 'Jasa Rumah' },
        slug: 'home-services',
        icon: 'home',
        sortOrder: 1
      },
      {
        name: { en: 'Professional Services', id: 'Jasa Profesional' },
        slug: 'professional-services',
        icon: 'briefcase',
        sortOrder: 2
      },
      {
        name: { en: 'Tutoring & Lessons', id: 'Les & Kursus' },
        slug: 'tutoring-lessons',
        icon: 'graduation-cap',
        sortOrder: 3
      },
      {
        name: { en: 'Health & Wellness', id: 'Kesehatan & Wellness' },
        slug: 'health-wellness',
        icon: 'heart',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Jobs',
      id: 'Lowongan Kerja'
    },
    slug: 'jobs',
    description: {
      en: 'Job opportunities and career listings',
      id: 'Peluang kerja dan lowongan karir'
    },
    icon: 'briefcase',
    sortOrder: 8,
    children: [
      {
        name: { en: 'Full-time', id: 'Full-time' },
        slug: 'full-time',
        icon: 'clock',
        sortOrder: 1
      },
      {
        name: { en: 'Part-time', id: 'Part-time' },
        slug: 'part-time',
        icon: 'clock',
        sortOrder: 2
      },
      {
        name: { en: 'Freelance', id: 'Freelance' },
        slug: 'freelance',
        icon: 'laptop',
        sortOrder: 3
      },
      {
        name: { en: 'Internships', id: 'Magang' },
        slug: 'internships',
        icon: 'graduation-cap',
        sortOrder: 4
      }
    ]
  },
  {
    name: {
      en: 'Real Estate',
      id: 'Properti'
    },
    slug: 'real-estate',
    description: {
      en: 'Houses, apartments, land, and commercial properties',
      id: 'Rumah, apartemen, tanah, dan properti komersial'
    },
    icon: 'building',
    sortOrder: 9,
    children: [
      {
        name: { en: 'Houses for Sale', id: 'Rumah Dijual' },
        slug: 'houses-sale',
        icon: 'home',
        sortOrder: 1
      },
      {
        name: { en: 'Houses for Rent', id: 'Rumah Disewa' },
        slug: 'houses-rent',
        icon: 'home',
        sortOrder: 2
      },
      {
        name: { en: 'Apartments', id: 'Apartemen' },
        slug: 'apartments',
        icon: 'building',
        sortOrder: 3
      },
      {
        name: { en: 'Land & Lots', id: 'Tanah & Kavling' },
        slug: 'land-lots',
        icon: 'map',
        sortOrder: 4
      },
      {
        name: { en: 'Commercial', id: 'Komersial' },
        slug: 'commercial',
        icon: 'briefcase',
        sortOrder: 5
      }
    ]
  },
  {
    name: {
      en: 'Pets & Animals',
      id: 'Hewan Peliharaan'
    },
    slug: 'pets-animals',
    description: {
      en: 'Pets, pet supplies, and animal-related items',
      id: 'Hewan peliharaan, perlengkapan hewan, dan barang terkait hewan'
    },
    icon: 'dog',
    sortOrder: 10,
    children: [
      {
        name: { en: 'Dogs', id: 'Anjing' },
        slug: 'dogs',
        icon: 'dog',
        sortOrder: 1
      },
      {
        name: { en: 'Cats', id: 'Kucing' },
        slug: 'cats',
        icon: 'cat',
        sortOrder: 2
      },
      {
        name: { en: 'Birds', id: 'Burung' },
        slug: 'birds',
        icon: 'bird',
        sortOrder: 3
      },
      {
        name: { en: 'Pet Supplies', id: 'Perlengkapan Hewan' },
        slug: 'pet-supplies',
        icon: 'bone',
        sortOrder: 4
      }
    ]
  }
];

// Category management utilities
export const flattenCategories = (categories: DefaultCategory[]): DefaultCategory[] => {
  const result: DefaultCategory[] = [];
  
  const flatten = (cats: DefaultCategory[], parentSlug?: string) => {
    cats.forEach(cat => {
      const category = { ...cat, parent: parentSlug };
      result.push(category);
      
      if (cat.children) {
        flatten(cat.children, cat.slug);
      }
    });
  };
  
  flatten(categories);
  return result;
};

export const getCategoryBySlug = (slug: string, categories: DefaultCategory[] = defaultCategories): DefaultCategory | null => {
  const flattened = flattenCategories(categories);
  return flattened.find(cat => cat.slug === slug) || null;
};

export const getCategoryTree = (categories: DefaultCategory[] = defaultCategories): DefaultCategory[] => {
  return categories;
};

export const getCategoryPath = (slug: string, categories: DefaultCategory[] = defaultCategories): DefaultCategory[] => {
  const flattened = flattenCategories(categories);
  const category = flattened.find(cat => cat.slug === slug);
  
  if (!category) return [];
  
  const path: DefaultCategory[] = [category];
  let current = category;
  
  while (current.parent) {
    current = flattened.find(cat => cat.slug === current.parent) || current;
    if (current !== category) {
      path.unshift(current);
    } else {
      break; // Prevent infinite loop
    }
  }
  
  return path;
};