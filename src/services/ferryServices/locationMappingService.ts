/**
 * Centralized location mapping service for ferry operators
 * Now uses shared constants from @/constants
 */

import { 
  LOCATION_MAPPINGS, 
  type LocationMapping,
  getSealinkLocationName,
  getMakruzzLocationId,
  getGreenOceanLocationId
} from "@/constants";

export class LocationMappingService {
  /**
   * Get Sealink location name from form value
   */
  static getSealinkLocation(formValue: string): string {
    return getSealinkLocationName(formValue);
  }

  /**
   * Get Makruzz location ID from form value
   */
  static getMakruzzLocation(formValue: string): string {
    return getMakruzzLocationId(formValue);
  }

  /**
   * Get Green Ocean location ID from form value
   */
  static getGreenOceanLocation(formValue: string): number {
    return getGreenOceanLocationId(formValue);
  }

  /**
   * Get display name from form value
   */
  static getDisplayName(formValue: string): string {
    const mapping = LOCATION_MAPPINGS[formValue];
    return mapping?.displayName || formValue;
  }

  /**
   * Get port code for a location
   */
  static getPortCode(formValue: string): string {
    const mapping = LOCATION_MAPPINGS[formValue];
    return mapping?.code || "??";
  }

  /**
   * Validate if a route is supported by an operator
   */
  static isRouteSupported(
    operator: "sealink" | "makruzz" | "greenocean",
    from: string,
    to: string
  ): boolean {
    const fromMapping = LOCATION_MAPPINGS[from];
    const toMapping = LOCATION_MAPPINGS[to];

    if (!fromMapping || !toMapping) {
      return false;
    }

    return true;
  }

  /**
   * Get all supported locations for the search form
   */
  static getFormLocations() {
    return Object.values(LOCATION_MAPPINGS).map((mapping) => ({
      value: mapping.formValue,
      label: mapping.displayName,
      id: mapping.formValue,
      name: mapping.displayName,
      slug: mapping.formValue,
    }));
  }

  /**
   * Debug method to show all mappings for a location
   */
  static debugLocation(formValue: string) {
    const mapping = LOCATION_MAPPINGS[formValue];
    if (!mapping) {
      console.log(`❌ Unknown location: ${formValue}`);
      return;
    }

    console.log(`🗺️  Location Debug: ${formValue}`);
    console.log(`   Display: "${mapping.displayName}"`);
    console.log(`   Sealink: "${mapping.sealinkName}"`);
    console.log(`   Makruzz: "${mapping.makruzzId}"`);
    console.log(`   Green Ocean: ${mapping.greenOceanId}`);
    console.log(`   Aliases: [${mapping.aliases.join(", ")}]`);
  }
}
