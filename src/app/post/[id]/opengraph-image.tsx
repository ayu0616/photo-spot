import { ImageResponse } from "next/og";
import {
  convertCameraModelName,
  formatAperture,
  formatFocalLength,
  formatISO,
  formatShutterSpeed,
} from "@/lib/format-exif";
import { honoClient } from "@/lib/hono";

export const runtime = "edge";

export const alt = "Post Image";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = "normal" | "italic";
interface FontOptions {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: Weight;
  style?: FontStyle;
  lang?: string;
}

const getFont = async () => {
  // 参考： https://trpfrog.net/blog/google-fonts-on-satori
  try {
    if (!process.env.GOOGLE_FONTS_API_KEY) {
      throw new Error("GOOGLE_FONTS_API_KEY is not set");
    }
    const url = new URL("https://www.googleapis.com/webfonts/v1/webfonts");
    url.searchParams.set("family", "Noto Sans JP");
    url.searchParams.set("key", process.env.GOOGLE_FONTS_API_KEY);

    const fontInfo = await fetch(url).then((res) => res.json());
    const fontResponse = await fetch(fontInfo.items[0].files.regular);
    const fontBuffer = await fontResponse.arrayBuffer();
    return fontBuffer;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params;

  const fontData = await getFont();

  const fonts: FontOptions[] = [];
  if (fontData) {
    fonts.push({
      name: "Noto Sans JP", // CSSのfontFamilyと一致させる
      data: fontData,
      style: "normal",
    });
  }

  const res = await honoClient.post[":id"].$get({
    param: {
      id,
    },
  });

  if (!res.ok) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Noto Sans JP",
        }}
      >
        Post not found
      </div>,
      {
        ...size,
        fonts,
      },
    );
  }

  const post = await res.json();

  const shutterSpeed = formatShutterSpeed(post.photo.shutterSpeed);
  const settingsItems: string[] = [];

  // Focal Length Logic
  if (
    post.photo.focalLength35mm &&
    post.photo.focalLength35mm !== post.photo.focalLength
  ) {
    settingsItems.push(
      `${formatFocalLength(post.photo.focalLength35mm)}(35mm換算)`,
    );
  } else {
    const formatted = formatFocalLength(post.photo.focalLength);
    if (formatted && formatted !== "-") {
      settingsItems.push(formatted);
    }
  }

  // Aperture
  const aperture = formatAperture(post.photo.aperture);
  if (aperture && aperture !== "-") {
    settingsItems.push(aperture);
  }

  // Shutter Speed
  if (shutterSpeed && shutterSpeed !== "-") {
    settingsItems.push(`${shutterSpeed}s`);
  }

  // ISO
  const iso = formatISO(post.photo.iso);
  if (iso && iso !== "-") {
    settingsItems.push(iso);
  }

  return new ImageResponse(
    <div
      style={{
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Noto Sans JP",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/** biome-ignore lint/performance/noImgElement: satoriのog画像生成用 */}
        <img
          src={post.photo.url}
          alt={post.description || "Post Image"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            padding: "20px 40px",
            display: "flex",
            flexDirection: "column",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              marginBottom: 6,
              display: "flex",
            }}
          >
            {post.spot.name}
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.9,
              display: "flex",
              marginBottom: 10,
            }}
          >
            {post.spot.city.prefecture.name} {post.spot.city.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {post.user.image && (
              // biome-ignore lint/performance/noImgElement: satoriのog画像生成用
              <img
                src={post.user.image}
                alt={post.user.name || "User"}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                }}
              />
            )}
            <div style={{ fontSize: 20, display: "flex" }}>
              {post.user.name}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          background: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 40px",
          color: "black",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: "bold" }}>
          {convertCameraModelName(post.photo.cameraModel)}
        </div>
        {post.photo.lensModel && (
          <div style={{ fontSize: 18 }}>{post.photo.lensModel}</div>
        )}
        <div style={{ fontSize: 18, color: "#374151" }}>
          {settingsItems.join(", ")}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
