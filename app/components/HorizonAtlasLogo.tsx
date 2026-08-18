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
  const toneClassName = tone === "monochrome" ? "opacity-80 grayscale" : "";
  const mark = (
    <span className={`relative block h-10 w-10 shrink-0 lg:h-11 lg:w-11 ${toneClassName} ${iconClassName}`.trim()} aria-hidden="true">
      <span className="absolute left-1 top-0 h-8 w-8 -rotate-45 rounded-[50%_50%_50%_0] border-2 border-[#e8b957] bg-[#06203b] shadow-[0_0_16px_rgba(232,185,87,0.2)] lg:h-9 lg:w-9" />
      <span className="absolute left-[13px] top-[8px] h-3.5 w-3.5 rounded-full bg-[linear-gradient(180deg,#efbe59_0_48%,#2aa7ad_48%)] lg:left-[14px] lg:top-[9px] lg:h-4 lg:w-4" />
      <span className="absolute bottom-0 left-1.5 h-0.5 w-7 bg-[#2aa7ad] lg:w-8" />
    </span>
  );

  if (layout === "icon") {
    return mark;
  }

  if (layout === "stacked") {
    return (
      <span className={`flex flex-col items-center justify-center gap-3 leading-none ${className}`.trim()}>
        {mark}
        <span className="font-serif text-2xl text-current">DestinationFinder<span className="text-[#2aa7ad]">AI</span></span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 leading-none ${className}`.trim()}>
      {mark}
      <span className="whitespace-nowrap font-serif text-[1.1rem] font-semibold sm:text-xl lg:text-[1.65rem]">
        DestinationFinder<span className="text-[#2aa7ad]">AI</span>
      </span>
    </span>
  );
}
