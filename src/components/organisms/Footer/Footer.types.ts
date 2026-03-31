export interface FooterProps {
  className?: string;
}

export interface FooterContent {
  logo: {
    src: string;
    alt: string;
  };
  sections: FooterSection[];
  copyright: string;
  socialLinks: SocialLink[];
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: string;
}
