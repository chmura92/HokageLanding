export interface CustomIcon {
  path: string;
  hex: string;
  title: string;
  viewBox?: string; // defaults to "0 0 24 24" in the component
  fillRule?: "nonzero" | "evenodd";
}

// SVG paths on a 24×24 viewBox, fill-based only (no zero-width lines or strokes)
export const customIcons: Record<string, CustomIcon> = {
  // C# — pointy-top hexagon badge with C + # cut out via evenodd (matches official Microsoft C# logo)
  // Sub-path 1: hexagon fills. Sub-paths 2+3: C crescent and # outline become transparent holes.
  "C#": {
    hex: "512BD4",
    title: "C Sharp",
    fillRule: "evenodd",
    path: "M12 2L21 7V17L12 22L3 17V7Z" +
      "M11 7.5C8 4.5 3 6.5 3 12C3 17.5 8 19.5 11 16.5L10 14.5C8 16.5 5.5 15.5 5.5 12C5.5 8.5 8 7.5 10 9Z" +
      "M12.5 9.5L14 9.5L14 7.5L15.5 7.5L15.5 9.5L17.5 9.5L17.5 7.5L19 7.5L19 9.5L20 9.5L20 11L19 11L19 13L20 13L20 14.5L19 14.5L19 16.5L17.5 16.5L17.5 14.5L15.5 14.5L15.5 16.5L14 16.5L14 14.5L12.5 14.5L12.5 13L14 13L14 11L12.5 11Z",
  },

  // Microsoft Azure — two overlapping triangular planes forming a mountain peak
  Azure: {
    hex: "0078D4",
    title: "Microsoft Azure",
    path: "M13.47 3h-2.94L3 19.75h4.21l2.35-5.05h4.88l2.35 5.05H21L13.47 3zM12 8.2l1.6 4.05H10.4L12 8.2z",
  },

  // EF Core — database cylinder with three stacked ellipses
  "EF Core": {
    hex: "512BD4",
    title: "Entity Framework Core",
    path: "M12 3C7.582 3 4 4.343 4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6c0-1.657-3.582-3-8-3zm0 2c3.314 0 6 .895 6 2s-2.686 2-6 2-6-.895-6-2 2.686-2 6-2zm6 4.236V12c0 1.105-2.686 2-6 2s-6-.895-6-2V9.236C7.348 9.714 9.569 10 12 10s4.652-.286 6-.764zm0 5V17c0 1.105-2.686 2-6 2s-6-.895-6-2v-2.764C7.348 14.714 9.569 15 12 15s4.652-.286 6-.764z",
  },

  // SignalR — lightning bolt (real-time)
  SignalR: {
    hex: "512BD4",
    title: "SignalR",
    path: "M13 2L4.5 13.5H11L8.5 22 19.5 10.5H13z",
  },

  // Hangfire — bold "H" lettermark (matches official logo)
  Hangfire: {
    hex: "0D6EFD",
    title: "Hangfire",
    path: "M4 4h4v6h8V4h4v16h-4v-6H8v6H4z",
  },

  // MediatR — bold capital M letterform: two vertical strokes + two diagonal fills
  MediatR: {
    hex: "3B82F6",
    title: "MediatR",
    path: "M2 3h3v18h-3zM19 3h3v18h-3zM5 3L12 12 5 12zM19 3L12 12 19 12z",
  },

  // SQL Server — database cylinder
  "SQL Server": {
    hex: "CC2927",
    title: "Microsoft SQL Server",
    path: "M12 3C7.582 3 4 4.343 4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6c0-1.657-3.582-3-8-3zm0 2c3.314 0 6 .895 6 2s-2.686 2-6 2-6-.895-6-2 2.686-2 6-2zm6 4.236V12c0 1.105-2.686 2-6 2s-6-.895-6-2V9.236C7.348 9.714 9.569 10 12 10s4.652-.286 6-.764zm0 5V17c0 1.105-2.686 2-6 2s-6-.895-6-2v-2.764C7.348 14.714 9.569 15 12 15s4.652-.286 6-.764z",
  },

  // Azure DevOps — overlapping diamond shapes
  "Azure DevOps": {
    hex: "0078D4",
    title: "Azure DevOps",
    path: "M22 5.5l-5.8.9L12.5 3 7 5.6v3.1L2 10l2 8.2 4.5 1.4.5-1.5-2.5-.8-1.5-6 3.5-1.2V17l3.5 2 3.5-2V8.7l3-1.7 1.5 6.6-2.5.7.5 1.5L23 15z",
  },

  // Azure Portal — three stacked layers
  "Azure Portal": {
    hex: "0078D4",
    title: "Azure Portal",
    path: "M3 6l9-4 9 4-9 4-9-4zm0 5l9 4 9-4v2l-9 4-9-4v-2zm0 6l9 4 9-4v2l-9 4-9-4v-2z",
  },

  // Visual Studio — VS shield/ribbon
  "Visual Studio": {
    hex: "5C2D91",
    title: "Visual Studio",
    path: "M17.583 3L9 13.5 5.583 10 3 12l6 9 12-13.333L17.583 3zM9 18.277L6.055 14.5 9 11.724l4.5 5.276L9 18.277z",
  },

  // Playwright — clean capital P letterform (Microsoft testing tool)
  Playwright: {
    hex: "2EAD33",
    title: "Playwright",
    path: "M6 3h6.5a5.5 5.5 0 010 11H9v7H6V3zm3 3v5h3.5a2.5 2.5 0 000-5H9z",
  },

  // xUnit — X mark inside a circle
  xUnit: {
    hex: "512BD4",
    title: "xUnit",
    path: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm-2.828 3.757l1.414-1.414L12 9.172l1.414-1.829 1.414 1.414L13.414 12l1.414 1.414-1.414 1.414L12 14.828l-1.414-1.414L8.757 9.171l1.415-1.414z",
  },

  // OpenAI — the well-known bloom/gear logo
  OpenAI: {
    hex: "412991",
    title: "OpenAI",
    path: "M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A5.985 5.985 0 0011.39 0a6.046 6.046 0 00-5.764 4.195 5.985 5.985 0 00-3.99 2.9 6.046 6.046 0 00.745 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.516 2.9A5.985 5.985 0 0012.61 24a6.056 6.056 0 005.77-4.206 5.99 5.99 0 003.99-2.9 6.056 6.056 0 00-.751-7.073l-.337.337zM12.61 22.013a4.492 4.492 0 01-2.884-1.04l.142-.081 4.783-2.763a.795.795 0 00.4-.689v-6.75l2.024 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.503 4.52zm-9.706-4.13a4.491 4.491 0 01-.535-3.014l.142.085 4.783 2.763a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.032.067L9.129 19.95a4.5 4.5 0 01-6.225-2.067zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.024 1.168a.076.076 0 01-.071 0L4.006 13.95a4.5 4.5 0 01-1.666-6.053zm16.597 3.855l-5.843-3.369 2.024-1.168a.076.076 0 01.071 0l4.808 2.781a4.494 4.494 0 01-.676 8.105v-5.678a.795.795 0 00-.384-.671zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.08.08 0 01.032-.067l4.783-2.761a4.496 4.496 0 016.662 4.66zm-12.64 4.135l-2.024-1.168a.08.08 0 01-.038-.057V6.075a4.496 4.496 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.4.689zm1.098-2.365l2.602-1.5 2.602 1.5v2.999l-2.602 1.5-2.602-1.5V11.498z",
  },

  // Xamarin — solid X polygon (12-point path, traced around X border)
  Xamarin: {
    hex: "3498DB",
    title: "Xamarin",
    path: "M7.757 6.343L12 10.586l4.243-4.243 1.414 1.414L13.414 12l4.243 4.243-1.414 1.414L12 13.414l-4.243 4.243-1.414-1.414L10.586 12 6.343 7.757z",
  },

  // DALL·E — abstract paint dots in a circle (generative art)
  "DALL·E": {
    hex: "412991",
    title: "DALL·E",
    path: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zM8.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-7 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z",
  },
};
