// import React, { useState, memo, useCallback } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import styles from "../FerryCard.module.css";
// import { Button, ImageContainer } from "@/components/atoms";

// interface ImageSliderProps {
//   images: string[];
//   altText: string;
// }

// export const ImageSlider = memo<ImageSliderProps>(({ images, altText }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const handlePrevious = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation();
//       setCurrentIndex((prevIndex) =>
//         prevIndex === 0 ? images.length - 1 : prevIndex - 1
//       );
//     },
//     [images.length]
//   );

//   const handleNext = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation();
//       setCurrentIndex((prevIndex) =>
//         prevIndex === images.length - 1 ? 0 : prevIndex + 1
//       );
//     },
//     [images.length]
//   );

//   // Render placeholder when no images are available
//   if (images.length === 0) {
//     return (
//       <div className={styles.imageSliderContainer}>
//         <div className={styles.imageContainer}>
//           <ImageContainer
//             src=""
//             alt="No images available"
//             className={styles.ferryImage}
//             aspectRatio="auto"
//             objectFit="cover"
//             fullWidth={true}
//           />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.imageSliderContainer}>
//       <div className={styles.imageContainer}>
//         <ImageContainer
//           src={images[currentIndex]}
//           alt={altText}
//           className={styles.ferryImage}
//           aspectRatio="auto"
//           objectFit="cover"
//           fullWidth={true}
//         />
//       </div>
//       {images.length > 1 && (
//         <>
//           <Button
//             variant="secondary"
//             size="small"
//             className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
//             onClick={handlePrevious}
//             aria-label={"previous image"}
//             type="button"
//           >
//             <ChevronLeft size={16} aria-hidden="true" />
//           </Button>
//           <Button
//             variant="secondary"
//             size="small"
//             className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
//             onClick={handleNext}
//             aria-label={"next image"}
//             type="button"
//           >
//             <ChevronRight size={16} aria-hidden="true" />
//           </Button>
//         </>
//       )}
//     </div>
//   );
// });

// ImageSlider.displayName = "ImageSlider";
