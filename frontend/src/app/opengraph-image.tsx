import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Platinum Square Real Estate - Luxury Properties in Dubai';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
// Image generation
export default async function Image() {
  // Font
  const interSemiBold = fetch(
    new URL('../fonts/Inter-SemiBold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());
 
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #1a1a1a, #333)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          Platinum Square
        </div>
        <div
          style={{
            fontSize: 36,
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Luxury Real Estate in Dubai
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '16px 32px',
            borderRadius: 16,
            fontSize: 24,
          }}
        >
          Discover Exclusive Properties
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await interSemiBold,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}
