# InlineLink Component

The InlineLink component is a styled link component that provides a consistent look and feel for inline links throughout the application. It supports different icon types, colors, and behaviors.

## Features

- Customizable icon (arrow-up-right, arrow-right, or none)
- Color variants (primary, secondary, white)
- Hover animation for both text and icon
- Accessibility support with aria-label
- External link support with target and rel attributes

## Usage

```tsx
import { InlineLink } from "@/components/atoms/InlineLink";

// Basic usage
<InlineLink href="/about">Learn more</InlineLink>

// With custom icon
<InlineLink
  href="/services"
  icon="arrow-right"
  iconSize={18}
>
  View services
</InlineLink>

// With custom color
<InlineLink
  href="/contact"
  color="secondary"
>
  Contact us
</InlineLink>

// External link
<InlineLink
  href="https://example.com"
  target="_blank"
>
  Visit external site
</InlineLink>

// With aria-label for accessibility
<InlineLink
  href="/products"
  ariaLabel="Browse our product catalog"
>
  Products
</InlineLink>
```

## Props

| Prop      | Type                                        | Default          | Description                               |
| --------- | ------------------------------------------- | ---------------- | ----------------------------------------- |
| href      | string                                      | -                | The URL to navigate to                    |
| children  | ReactNode                                   | -                | The content to display inside the link    |
| className | string                                      | -                | Additional CSS classes to apply           |
| ariaLabel | string                                      | -                | Accessibility label for the link          |
| icon      | "arrow-up-right" \| "arrow-right" \| "none" | "arrow-up-right" | The icon to display next to the link text |
| iconSize  | number                                      | 20               | The size of the icon in pixels            |
| color     | "primary" \| "secondary" \| "white"         | "primary"        | The color theme of the link               |
| onClick   | () => void                                  | -                | Function to call when the link is clicked |
| target    | "\_blank" \| "\_self"                       | "\_self"         | Where to open the linked document         |

## Styling

The InlineLink component includes hover animations:

- Text underline animation
- Icon movement animation

The styling is defined in `InlineLink.module.css` and uses CSS variables from the global theme.
