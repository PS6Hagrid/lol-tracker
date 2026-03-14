import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

function renderIcon(size: number) {
  const fontSize = Math.round(size * 0.55);
  const radius = Math.round(size * 0.2);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0e17 0%, #151d2e 100%)",
          borderRadius: radius,
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 900,
            color: "#C89B3C",
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    ),
    { width: size, height: size },
  );
}

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const size = Math.min(Math.max(parseInt(sizeParam ?? "512", 10) || 512, 16), 1024);

  const response = renderIcon(size);

  // Immutable cache — icon never changes
  response.headers.set(
    "Cache-Control",
    "public, immutable, max-age=31536000",
  );

  return response;
}
