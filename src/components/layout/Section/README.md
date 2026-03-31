# Section Component

A semantic section component that provides proper HTML structure and consistent spacing for page sections.

## Features

- Uses semantic HTML5 `<section>` tag
- Configurable background colors
- Adjustable vertical spacing
- Responsive design
- Built-in content width constraints

## Usage

```jsx
import { Section } from '@/components/layout';

// Basic usage
<Section>
  <p>Content goes here</p>
</Section>

// With background color and spacing
<Section backgroundColor="light" spacing="large" id="about">
  <h2>About Us</h2>
  <p>Section content...</p>
</Section>

// Full-width content
<Section fullWidth>
  <p>This content will expand to the full width of the section</p>
</Section>

// Without horizontal padding
<Section noPadding>
  <p>This section won't have horizontal padding</p>
</Section>
```

## Props

| Prop            | Type                                           | Default  | Description                            |
| --------------- | ---------------------------------------------- | -------- | -------------------------------------- |
| children        | ReactNode                                      | -        | Content to render within the section   |
| className       | string                                         | -        | Additional CSS class                   |
| id              | string                                         | -        | HTML id attribute for the section      |
| backgroundColor | 'white' \| 'light' \| 'primary' \| 'secondary' | 'white'  | Background color of the section        |
| spacing         | 'small' \| 'medium' \| 'large'                 | 'medium' | Vertical padding of the section        |
| fullWidth       | boolean                                        | false    | Whether content should take full width |
| noPadding       | boolean                                        | false    | Whether to remove horizontal padding   |

## Background Colors

- **white**: White background (default)
- **light**: Light background (var(--color-foreground-light))
- **primary**: Primary color light background (var(--color-primary-light))
- **secondary**: Secondary color background (var(--color-secondary)) with white text

## Spacing Options

- **small**: Less vertical padding (var(--padding-4))
- **medium**: Standard vertical padding (var(--padding-6))
- **large**: More vertical padding (var(--padding-10))
