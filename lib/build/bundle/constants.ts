import type { BuildOptions } from "esbuild";

export const bundleConstants: Partial<BuildOptions> = {
  bundle: true,
  allowOverwrite: true,
  treeShaking: true,
  minify: true,

  inject: [`${__dirname}/inject/react-shim.ts`],

  loader: { ".ts": "ts", ".tsx": "tsx" },
  jsx: "transform",
  legalComments: "none",
};
