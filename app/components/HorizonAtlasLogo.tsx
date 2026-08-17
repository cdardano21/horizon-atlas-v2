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
  const iconSrc = "/brand/destinationfinder-ai-logo.png";
  const fullSrc = "/brand/destinationfinder-ai-logo.png";

  if (layout === "icon") {
    return (
      <Image
        src={iconSrc}
        alt="DestinationFinderAI"
        width={96}
        height={96}
        priority
        className={iconClassName || "h-12 w-auto shrink-0 sm:h-14 md:h-16"}
      />
    );
  }

  if (layout === "stacked") {
    return (
      <span className={`flex items-center justify-center leading-none ${className}`.trim()}>
        <Image
          src={fullSrc}
          alt="DestinationFinderAI"
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
        alt="DestinationFinderAI"
        width={1600}
        height={600}
        priority
        className={["mr-2 h-14 w-auto shrink-0 sm:mr-3 sm:h-16 md:mr-4 md:h-[4.5rem] lg:mr-5 lg:h-20", isMonochrome ? "opacity-90" : ""].filter(Boolean).join(" ")}
      />
    </span>
  );
}
