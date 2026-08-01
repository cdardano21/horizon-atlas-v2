import Image from "next/image";

type HorizonAtlasLogoProps = {
  layout?: "icon" | "horizontal" | "stacked";
  tone?: "light" | "dark" | "monochrome";
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
};

export default function HorizonAtlasLogo({
  layout = "horizontal",
  tone = "dark",
  className = "",
  iconClassName = "",
}: HorizonAtlasLogoProps) {
  const isMonochrome = tone === "monochrome";
  const iconSrc = "/brand/horizon-atlas-icon.svg";
  const fullSrc = "/design-reference/horizon%20atlas%20logo.JPG";

  if (layout === "icon") {
    return (
      <Image
        src={iconSrc}
        alt="Horizon Atlas"
        width={96}
        height={96}
        priority
        className={iconClassName || "h-10 w-auto shrink-0"}
      />
    );
  }

  if (layout === "stacked") {
    return (
      <span className={`flex items-center justify-center leading-none ${className}`.trim()}>
        <Image
          src={fullSrc}
          alt="Horizon Atlas"
          width={1600}
          height={600}
          priority
          className={["h-16 w-auto shrink-0 sm:h-20 md:h-24 lg:h-28", isMonochrome ? "opacity-90" : ""].filter(Boolean).join(" ")}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center leading-none ${className}`.trim()}>
      <Image
        src={fullSrc}
        alt="Horizon Atlas"
        width={1600}
        height={600}
        priority
        className={["mr-3 h-16 w-auto shrink-0 sm:mr-4 sm:h-20 md:mr-5 md:h-24 lg:mr-6 lg:h-28", isMonochrome ? "opacity-90" : ""].filter(Boolean).join(" ")}
      />
    </span>
  );
}
