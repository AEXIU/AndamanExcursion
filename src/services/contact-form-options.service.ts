import {
  packageService,
  packagePeriodService,
  packageCategoryService,
} from "./payload/collections/packages";
import {
  PackageOption,
  PeriodOption,
  CategoryOption,
  ContactFormOptions,
} from "@/types/contact-form-options.types";

/**
 * Service to fetch contact form dropdown options from Payload CMS
 */
export const contactFormOptionsService = {
  async getAllOptions(): Promise<ContactFormOptions> {
    try {
      // Fetch all data in parallel for better performance
      const [packages, periods, categories] = await Promise.all([
        packageService.getAll({ limit: 1000, depth: 2 }),
        packagePeriodService.getAll(),
        packageCategoryService.getAll(),
      ]);

      // Transform packages data for dropdown options
      const packageOptions: PackageOption[] = packages.map((pkg: any) => ({
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        categoryTitle:
          typeof pkg.coreInfo?.category === "object"
            ? pkg.coreInfo.category.title
            : undefined,
        price: pkg.pricing?.price,
      }));

      // Transform periods data
      const periodOptions: PeriodOption[] = periods.map((period: any) => ({
        id: period.id,
        title: period.title,
        value: period.value,
        order: period.order || 0,
      }));

      // Transform categories data
      const categoryOptions: CategoryOption[] = categories.map(
        (category: any) => ({
          id: category.id,
          title: category.title,
          slug: category.slug,
        })
      );

      return {
        packages: packageOptions,
        periods: periodOptions,
        categories: categoryOptions,
        isLoading: false,
      };
    } catch (error) {
      console.error("Error fetching contact form options:", error);
      return {
        packages: [],
        periods: [],
        categories: [],
        isLoading: false,
        error: "Failed to load form options",
      };
    }
  },

  async getPackagesByCategory(categorySlug: string): Promise<PackageOption[]> {
    try {
      const packages = await packageService.getByCategorySlug(
        categorySlug,
        1000
      );

      return packages.map((pkg: any) => ({
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        categoryTitle:
          typeof pkg.coreInfo?.category === "object"
            ? pkg.coreInfo.category.title
            : undefined,
        price: pkg.pricing?.price,
      }));
    } catch (error) {
      console.error("Error fetching packages by category:", error);
      return [];
    }
  },

  async getPackageBySlug(slug: string): Promise<PackageOption | null> {
    try {
      const pkg = await packageService.getBySlug(slug);

      if (!pkg) return null;

      return {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        categoryTitle:
          typeof pkg.coreInfo?.category === "object"
            ? pkg.coreInfo.category.title
            : undefined,
        price: pkg.pricing?.price,
      };
    } catch (error) {
      console.error("Error fetching package by slug:", error);
      return null;
    }
  },
};
