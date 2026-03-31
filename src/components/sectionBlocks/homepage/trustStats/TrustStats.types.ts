export interface TrustStatsProps {
  content: TrustStatsContent;
}

export interface TrustStatsContent {
  title: {
    text: string;
    specialWord: string;
  };
  stats: Stat[];
}

export interface Stat {
  value: string;
  label: string;
  description: string;
  icon: string;
}
