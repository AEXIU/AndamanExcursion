# ImageContainer Component

A flexible component for displaying images with various aspect ratios and styling options.

## Features

- Multiple predefined aspect ratios
- Different object-fit options
- Responsive design
- Support for Next.js Image optimization

## Usage

```jsx
import { ImageContainer } from '@/components/atoms/ImageContainer';
import myImage from '@public/images/my-image.jpg';

// Basic usage with default settings
<ImageContainer
  src={myImage}
  alt="Description of the image"
/>

// Banner image with priority loading
<ImageContainer
  src={myImage}
  alt="Banner image"
  aspectRatio="banner"
  priority
  fullWidth
/>

// Square image with contain fit
<ImageContainer
  src={myImage}
  alt="Square image"
  aspectRatio="square"
  objectFit="contain"
/>
```

## Props

| Prop        | Type                                                                   | Default | Description                                          |
| ----------- | ---------------------------------------------------------------------- | ------- | ---------------------------------------------------- |
| src         | string \| StaticImport                                                 | -       | Image source (URL or imported image)                 |
| alt         | string                                                                 | -       | Alternative text for the image                       |
| className   | string                                                                 | -       | Additional CSS class                                 |
| aspectRatio | 'auto' \| 'square' \| 'video' \| 'portrait' \| 'landscape' \| 'banner' | 'auto'  | Aspect ratio of the container                        |
| objectFit   | 'cover' \| 'contain' \| 'fill'                                         | 'cover' | How the image should be resized to fit the container |
| priority    | boolean                                                                | false   | Whether to prioritize loading this image             |
| fullWidth   | boolean                                                                | false   | Whether the container should take full width         |

## Aspect Ratios

- **auto**: No fixed aspect ratio (min-height: 200px)
- **square**: 1:1 aspect ratio
- **video**: 16:9 aspect ratio (widescreen video)
- **portrait**: 3:4 aspect ratio (vertical orientation)
- **landscape**: 4:3 aspect ratio (horizontal orientation)
- **banner**: 21:9 aspect ratio (ultra-wide banner, becomes 16:9 on mobile)
