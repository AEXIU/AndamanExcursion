export interface PackageOption {
  id: string;
  label: string;
}

export interface PeriodOption {
  id: string;
  label: string;
}

export interface PackageSelectorProps {
  packageOptions: PackageOption[];
  periodOptions: PeriodOption[];
  onPackageChange?: (packageId: string) => void;
  onPeriodChange?: (periodId: string) => void;
  className?: string;
  defaultPackage?: string;
  defaultPeriod?: string;
}
