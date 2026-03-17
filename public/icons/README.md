# PWA Icons

This directory should contain the following icon files for PWA support:

## Required Icons
- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## Design Guidelines
- Use the app's primary color (green #22c55e)
- Include the app logo or "E" letter mark
- Ensure icons work on both light and dark backgrounds
- Test on iOS and Android devices

## Generation Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## iOS Specific
For iOS, also consider adding:
- `apple-touch-icon.png` - 180x180 pixels
- Splash screens for different device sizes

## Testing
1. Build the app
2. Serve locally with HTTPS
3. Open Chrome DevTools > Application > Manifest
4. Verify all icons are loaded correctly
5. Test "Add to Home Screen" on mobile devices
