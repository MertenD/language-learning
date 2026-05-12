import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const size = Math.min(parseInt(searchParams.get('size') ?? '192'), 512)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#6366f1',
          borderRadius: size * 0.18,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: size * 0.55,
            fontWeight: 700,
            fontFamily: 'sans-serif',
          }}
        >
          L
        </span>
      </div>
    ),
    { width: size, height: size },
  )
}
