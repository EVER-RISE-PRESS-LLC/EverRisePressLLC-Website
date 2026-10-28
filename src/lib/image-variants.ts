/** Prepared static image sizes. No runtime resizing or paid image service. */
export const imageVariants: Record<string, { src: string; srcSet: string; avifSrcSet?: string }> = {
  "/images/logo.png": {
    "src": "/images/optimized/logo-144.webp",
    "srcSet": "/images/optimized/logo-72.webp 72w, /images/optimized/logo-144.webp 144w"
  },
  "/images/books/financial-heart-attack-cover.webp": {
    "src": "/images/optimized/books-financial-heart-attack-cover-400.webp",
    "srcSet": "/images/optimized/books-financial-heart-attack-cover-240.webp 240w, /images/optimized/books-financial-heart-attack-cover-400.webp 400w, /images/optimized/books-financial-heart-attack-cover-640.webp 640w, /images/optimized/books-financial-heart-attack-cover-800.webp 800w"
  },
  "/images/authors/lamont-mcleod.jpg": {
    "src": "/images/optimized/authors-lamont-mcleod-640.webp",
    "srcSet": "/images/optimized/authors-lamont-mcleod-96.webp 96w, /images/optimized/authors-lamont-mcleod-384.webp 384w, /images/optimized/authors-lamont-mcleod-640.webp 640w"
  },
  "/images/stack/img1.jpg": {
    "src": "/images/optimized/stack-img1-634.webp",
    "srcSet": "/images/optimized/stack-img1-320.webp 320w, /images/optimized/stack-img1-634.webp 634w",
    "avifSrcSet": "/images/optimized/stack-img1-320.avif 320w, /images/optimized/stack-img1-634.avif 634w"
  },
  "/images/stack/img2.jpg": {
    "src": "/images/optimized/stack-img2-640.webp",
    "srcSet": "/images/optimized/stack-img2-320.webp 320w, /images/optimized/stack-img2-640.webp 640w, /images/optimized/stack-img2-960.webp 960w",
    "avifSrcSet": "/images/optimized/stack-img2-320.avif 320w, /images/optimized/stack-img2-640.avif 640w, /images/optimized/stack-img2-960.avif 960w"
  },
  "/images/stack/img3.jpg": {
    "src": "/images/optimized/stack-img3-640.webp",
    "srcSet": "/images/optimized/stack-img3-320.webp 320w, /images/optimized/stack-img3-640.webp 640w, /images/optimized/stack-img3-736.webp 736w",
    "avifSrcSet": "/images/optimized/stack-img3-320.avif 320w, /images/optimized/stack-img3-640.avif 640w, /images/optimized/stack-img3-736.avif 736w"
  },
  "/images/stack/img4.jpg": {
    "src": "/images/optimized/stack-img4-640.webp",
    "srcSet": "/images/optimized/stack-img4-320.webp 320w, /images/optimized/stack-img4-640.webp 640w, /images/optimized/stack-img4-960.webp 960w",
    "avifSrcSet": "/images/optimized/stack-img4-320.avif 320w, /images/optimized/stack-img4-640.avif 640w, /images/optimized/stack-img4-960.avif 960w"
  }
};
