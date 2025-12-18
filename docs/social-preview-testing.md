# Social Preview Testing Guide

This guide explains how to test that social media previews (Open Graph and Twitter Cards) render correctly for shared cards.

## Overview

When a card is shared on social media platforms, the preview should show:
- **Image**: The card's cover image
- **Title**: "A {Vibe} {Occasion} Card" (e.g., "A Warm Christmas Card")
- **Description**: "A beautiful holiday card created with AI"

## Testing Tools

### 1. Facebook Sharing Debugger

**URL**: https://developers.facebook.com/tools/debug/

**Steps**:
1. Enter your card URL: `https://yourdomain.com/c/christmas/{slug}`
2. Click "Debug"
3. Click "Scrape Again" to refresh cached data
4. Verify:
   - ✅ Image displays correctly
   - ✅ Title matches expected format
   - ✅ Description is present
   - ✅ No errors or warnings

**Note**: Facebook caches previews. Use "Scrape Again" to refresh.

### 2. Twitter Card Validator

**URL**: https://cards-dev.twitter.com/validator

**Steps**:
1. Enter your card URL
2. Click "Preview card"
3. Verify:
   - ✅ Card type is "summary_large_image"
   - ✅ Image displays correctly
   - ✅ Title and description are correct

**Note**: Twitter also caches previews. May need to wait or use a different URL.

### 3. LinkedIn Post Inspector

**URL**: https://www.linkedin.com/post-inspector/

**Steps**:
1. Enter your card URL
2. Click "Inspect"
3. Verify:
   - ✅ Image displays correctly
   - ✅ Title and description are present

### 4. Open Graph Debugger (Generic)

**URL**: https://www.opengraph.xyz/

**Steps**:
1. Enter your card URL
2. Review the extracted metadata
3. Verify all Open Graph tags are present

## Local Testing

### Using curl

Test the HTML response and metadata:

```bash
curl -s https://yourdomain.com/c/christmas/{slug} | grep -E '(og:|twitter:)' | head -20
```

### Using Browser DevTools

1. Open your card page in a browser
2. Right-click → "Inspect" → "Elements"
3. Look for `<meta>` tags in `<head>`:
   ```html
   <meta property="og:title" content="A Warm Christmas Card" />
   <meta property="og:description" content="A beautiful holiday card created with AI" />
   <meta property="og:image" content="https://..." />
   <meta name="twitter:card" content="summary_large_image" />
   ```

## Common Issues

### 1. Image Not Displaying

**Symptoms**: Preview shows no image or broken image

**Causes**:
- Image URL is not publicly accessible
- Image URL uses `localhost` (won't work in production)
- Image URL has incorrect CORS headers
- Image is too large (> 5MB for some platforms)

**Solutions**:
- Ensure images are hosted on S3/R2 with public access
- Check image URL is accessible from external networks
- Verify image dimensions (recommended: 1200x630px for OG images)
- Check image format (JPEG/PNG)

### 2. Cached Preview

**Symptoms**: Old preview data shows even after updating metadata

**Solutions**:
- Use platform-specific debuggers to refresh cache
- Add a query parameter to force refresh: `?v=2`
- Wait 24-48 hours for cache to expire naturally

### 3. Title/Description Missing

**Symptoms**: Preview shows default site title instead of card title

**Causes**:
- Metadata not generated correctly
- Server-side rendering issue
- Missing metadata tags

**Solutions**:
- Verify `generateMetadata` function in `app/c/[occasion]/[slug]/page.tsx`
- Check that card data is fetched correctly
- Ensure metadata is returned before page renders

## Automated Testing

### Test Script

Create a test script to verify metadata:

```typescript
// scripts/test-social-preview.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testSocialPreview(cardUrl: string) {
  const response = await fetch(cardUrl);
  const html = await response.text();
  
  // Extract metadata
  const ogTitle = html.match(/property="og:title" content="([^"]+)"/)?.[1];
  const ogImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  const ogDescription = html.match(/property="og:description" content="([^"]+)"/)?.[1];
  const twitterCard = html.match(/name="twitter:card" content="([^"]+)"/)?.[1];
  
  console.log('Social Preview Metadata:');
  console.log('  OG Title:', ogTitle);
  console.log('  OG Image:', ogImage);
  console.log('  OG Description:', ogDescription);
  console.log('  Twitter Card:', twitterCard);
  
  // Verify all required fields
  const checks = {
    'OG Title present': !!ogTitle,
    'OG Image present': !!ogImage,
    'OG Description present': !!ogImage,
    'Twitter Card type correct': twitterCard === 'summary_large_image',
  };
  
  console.log('\nValidation:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });
  
  return Object.values(checks).every(Boolean);
}

// Usage
const cardUrl = process.argv[2] || 'http://localhost:3000/c/christmas/test-slug';
testSocialPreview(cardUrl);
```

## Best Practices

1. **Image Dimensions**: Use 1200x630px for optimal display across platforms
2. **Image Format**: Use JPEG for photos, PNG for graphics
3. **File Size**: Keep images under 1MB for faster loading
4. **Alt Text**: Ensure images have descriptive alt text
5. **Cache Busting**: Use versioned URLs or query params for updated previews
6. **Testing**: Test on multiple platforms before sharing widely

## Checklist

Before deploying, verify:

- [ ] Open Graph tags are present in HTML
- [ ] Twitter Card tags are present
- [ ] Images are publicly accessible
- [ ] Images load correctly from external networks
- [ ] Title format matches: "A {Vibe} {Occasion} Card"
- [ ] Description is present and appropriate
- [ ] Preview renders correctly on Facebook
- [ ] Preview renders correctly on Twitter
- [ ] Preview renders correctly on LinkedIn
- [ ] No console errors when fetching metadata

## Troubleshooting

If previews aren't working:

1. **Check metadata generation**: Verify `generateMetadata` function
2. **Verify image URLs**: Ensure images are accessible
3. **Test with debuggers**: Use platform-specific tools
4. **Check server logs**: Look for errors during SSR
5. **Validate HTML**: Ensure metadata tags are in `<head>`
6. **Clear caches**: Use debugger tools to refresh

## Example Test URLs

After deploying, test with these formats:

```
https://yourdomain.com/c/christmas/{slug}
https://yourdomain.com/c/christmas/{slug}?src=linkedin
```

Replace `{slug}` with an actual card slug from your database.
