// Global type declarations for file types imported as side-effects or modules

// CSS modules / side-effect imports
declare module '*.css' {
  const css: string;
  export default css;
}

// Font packages (side-effect imports only)
declare module '@fontsource-variable/*' { const v: unknown; export default v; }
declare module '@fontsource/*' { const v: unknown; export default v; }
declare module '@fontsource/*/*.css' { const v: unknown; export default v; }
declare module '@fontsource-variable/*/*.css' { const v: unknown; export default v; }

// Asset files
declare module '*.svg' { const src: string; export default src; }
declare module '*.png' { const src: string; export default src; }
declare module '*.hdr' { const src: string; export default src; }
declare module '*.glb' { const src: string; export default src; }
declare module '*.ktx2' { const src: string; export default src; }
declare module '*.ogg' { const src: string; export default src; }
declare module '*.mp3' { const src: string; export default src; }
