#!/usr/bin/env node

/**
 * Test script to verify social preview metadata
 * Usage: npm run test:social-preview <card-url>
 * Example: npm run test:social-preview http://localhost:3000/c/christmas/test-slug
 */

async function testSocialPreview(cardUrl: string) {
  console.log(`🔍 Testing social preview for: ${cardUrl}\n`);

  try {
    const response = await fetch(cardUrl);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch URL: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const html = await response.text();
    
    // Extract Open Graph metadata
    const ogTitle = html.match(/property="og:title" content="([^"]+)"/)?.[1];
    const ogImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    const ogDescription = html.match(/property="og:description" content="([^"]+)"/)?.[1];
    const ogType = html.match(/property="og:type" content="([^"]+)"/)?.[1];
    
    // Extract Twitter Card metadata
    const twitterCard = html.match(/name="twitter:card" content="([^"]+)"/)?.[1];
    const twitterTitle = html.match(/name="twitter:title" content="([^"]+)"/)?.[1];
    const twitterDescription = html.match(/name="twitter:description" content="([^"]+)"/)?.[1];
    const twitterImage = html.match(/name="twitter:image" content="([^"]+)"/)?.[1];
    
    // Extract page title
    const pageTitle = html.match(/<title>([^<]+)<\/title>/)?.[1];
    
    console.log('📋 Metadata Found:\n');
    console.log('Open Graph:');
    console.log(`  Title: ${ogTitle || '❌ Missing'}`);
    console.log(`  Image: ${ogImage || '❌ Missing'}`);
    console.log(`  Description: ${ogDescription || '❌ Missing'}`);
    console.log(`  Type: ${ogType || '❌ Missing'}`);
    console.log('\nTwitter Card:');
    console.log(`  Card Type: ${twitterCard || '❌ Missing'}`);
    console.log(`  Title: ${twitterTitle || '❌ Missing'}`);
    console.log(`  Description: ${twitterDescription || '❌ Missing'}`);
    console.log(`  Image: ${twitterImage || '❌ Missing'}`);
    console.log(`\nPage Title: ${pageTitle || '❌ Missing'}`);
    
    // Validation checks
    const checks = {
      'OG Title present': !!ogTitle,
      'OG Image present': !!ogImage,
      'OG Description present': !!ogDescription,
      'OG Type is website': ogType === 'website',
      'Twitter Card type correct': twitterCard === 'summary_large_image',
      'Twitter Title present': !!twitterTitle,
      'Twitter Image present': !!twitterImage,
      'Page Title present': !!pageTitle,
    };
    
    console.log('\n✅ Validation Results:\n');
    let allPassed = true;
    Object.entries(checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      console.log(`  ${icon} ${check}`);
      if (!passed) allPassed = false;
    });
    
    // Check image accessibility
    if (ogImage) {
      console.log('\n🖼️  Testing image accessibility...');
      try {
        const imageResponse = await fetch(ogImage, { method: 'HEAD' });
        if (imageResponse.ok) {
          console.log(`  ✅ Image is accessible (${imageResponse.headers.get('content-type')})`);
          const contentLength = imageResponse.headers.get('content-length');
          if (contentLength) {
            const sizeMB = parseInt(contentLength) / (1024 * 1024);
            console.log(`  📦 Image size: ${sizeMB.toFixed(2)} MB`);
            if (sizeMB > 5) {
              console.log(`  ⚠️  Warning: Image is larger than recommended (5MB)`);
            }
          }
        } else {
          console.log(`  ❌ Image is not accessible: ${imageResponse.status}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`  ⚠️  Could not verify image accessibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('✅ All checks passed! Social preview should render correctly.');
      process.exit(0);
    } else {
      console.log('❌ Some checks failed. Please review the metadata.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing social preview:', error);
    process.exit(1);
  }
}

// Get URL from command line args or use default
const cardUrl = process.argv[2];

if (!cardUrl) {
  console.error('Usage: npm run test:social-preview <card-url>');
  console.error('Example: npm run test:social-preview http://localhost:3000/c/christmas/test-slug');
  process.exit(1);
}

testSocialPreview(cardUrl);
