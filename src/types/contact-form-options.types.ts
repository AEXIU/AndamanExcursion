// Types for contact form dropdown options from Payload CMS

export interface PackageOption {
  id: string;
  title: string;
  slug: string;
  categoryTitle?: string;
  price?: number;
}

export interface PeriodOption {
  id: string;
  title: string;
  value: string;
  order: number;
}

export interface CategoryOption {
  id: string;
  title: string;
  slug: string;
}

export interface ContactFormOptions {
  packages: PackageOption[];
  periods: PeriodOption[];
  categories: CategoryOption[];
  isLoading: boolean;
  error?: string;
}
