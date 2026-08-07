import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  /** `app` = mark dashboard only ; default = mark landing / assessment. */
  variant?: "default" | "app";
  /**
   * Frame filled by the image.
   * Prefer `aspect-square` + stretch so width stays equal to height.
   */
  frameClassName?: string;
};

const LOGO_SRC = {
  default: "/brand/leo-hello-pomelo.png",
  app: "/brand/hello-pomelo-app.png",
} as const;

/** Brand mark Hello Pomelo (PNG). */
export default function Logo({
  className,
  size = 28,
  variant = "default",
  frameClassName,
}: LogoProps) {
  const src = LOGO_SRC[variant];
  const isApp = variant === "app";

  if (frameClassName) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md",
          isApp && "bg-white",
          frameClassName
        )}
      >
        <Image
          src={src}
          alt="Hello Pomelo"
          fill
          sizes="(max-width: 640px) 96px, 128px"
          className={cn(
            isApp ? "object-contain p-1" : "object-cover",
            className
          )}
          priority
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Hello Pomelo"
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-md",
        isApp ? "bg-white object-contain" : "object-cover",
        className
      )}
      style={{ width: size, height: size }}
      priority
    />
  );
}
