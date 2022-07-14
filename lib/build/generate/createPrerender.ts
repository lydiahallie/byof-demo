import React from "react";
import fs from "fs-extra";
import { writeJson } from "fs-extra";

import type { PrerenderPageConfig } from "../../types";
import { createServerlessFunction } from "./createServerlessFunction";
import { createStaticFile } from "./createStaticFile";
import { getPageName } from "../../utils/page";

export async function createPrerender(
  Component: React.Element,
  filePath: string,
  pageConfig: PrerenderPageConfig
) {
  const pageName = getPageName(filePath);

  const funcFolder = `.vercel/output/functions/${pageName}.func`;
  await fs.ensureDir(funcFolder);

  try {
    await createServerlessFunction(Component, filePath);
    await createStaticFile(Component, filePath, {
      outdir: `.vercel/output/functions`,
      fileName: `${pageName}.prerender-fallback.html`,
      bundle: false,
    });

    await writeJson(
      `.vercel/output/functions/${pageName}.prerender-config.json`,
      {
        expiration: pageConfig.revalidate,
        group: 1,
        fallback: `${pageName}.prerender-fallback.html`,
      }
    );

    return writeJson(`${funcFolder}/.vc-config.json`, {
      runtime: "nodejs16.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
    });
  } catch (e) {
    console.log(e);
  }
}
