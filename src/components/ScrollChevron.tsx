export default function ScrollChevron() {
  return (
    <div
      onClick={() =>
        document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" })
      }
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer animate-scroll-chevron"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white opacity-50"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
