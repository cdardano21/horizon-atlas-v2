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
  wordmarkClassName = "",
}: HorizonAtlasLogoProps) {
  const toneClassName = tone === "monochrome" ? "opacity-80 grayscale" : "";

  if (layout === "icon") {
    return (
      <Image
        src="/brand/destinationfinderai-official-emblem.jpg"
        alt="DestinationFinderAI"
        width={340}
        height={340}
        sizes="48px"
        priority
        className={`h-11 w-11 shrink-0 object-cover lg:h-12 lg:w-12 ${toneClassName} ${iconClassName}`.trim()}
      />
    );
  }

  if (layout === "stacked") {
    return (
      <span className={`inline-flex items-center ${className}`.trim()}>
        <Image
          src="/brand/destinationfinderai-official-lockup.jpg"
          alt="DestinationFinderAI — Find Your Perfect Destination"
          width={1300}
          height={340}
          sizes="(min-width: 640px) 320px, 280px"
          priority
          className={`h-auto w-[280px] sm:w-[320px] ${toneClassName} ${wordmarkClassName}`.trim()}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <Image
        src="/brand/destinationfinderai-official-lockup.jpg"
        alt="DestinationFinderAI — Find Your Perfect Destination"
        width={1300}
        height={340}
        sizes="(min-width: 1024px) 270px, (min-width: 640px) 270px, 250px"
        priority
        className={`h-auto w-[250px] sm:w-[270px] ${toneClassName} ${wordmarkClassName}`.trim()}
      />
    </span>
  );
}
