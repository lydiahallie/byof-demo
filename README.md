# Demo

### About

Custom demo framework that uses the Build Output API to support:

- Static Rendering
- SSR
- Edge Rendering 
- Automatic Image Optimization

### How to use 

- Installing: `yarn install`
- Building: `yarn build:css && yarn build` 
- Deploying: `yarn deploy` 


# Web Framework Details

Source: https://vercel.com/blog/build-your-own-web-framework

Note: This demo framework is simplified. Production frameworks usually do more to create an optimized output, such as more advanced bundling, caching, type checking, and more. This blog post demonstrates how to create a basic yet functional example and deploy it to Vercel using the Build Output API.

Have you ever wondered what it takes to build your own web framework that also deploys to edge and serverless infrastructure? What features does a modern framework need to support, and how can we ensure that these features allow us to build a scalable, performant web application?

This explains how to build your own simple React-based web framework. We'll use the Vercel Build Output API to deploy our framework with support for the following features:
- Static Files to statically render pages
- Incremental Static Regeneration to automatically revalidate and regenerate pages after a specific timeout
- Edge Functions to enable edge rendering and middleware
- Automatic Image Optimization to efficiently serve the images using the latest format, enable lazy loading, and prevent layout shift
- Serverless Functions to server-render dynamic pages and create data fetching endpoints
- Edge Caching to quickly serve static files to users globally


### Landing Page 
Let's explore the requirements of each page we want to build and how to build optimizations into our web framework to help achieve excellent performance.

Demo website's landing page
Demo website's landing page
The landing page is a static page with a single large hero image. Although this page may seem simple, there are a few optimizations we can implement in our framework to ensure this page is fast.

Image Optimization

We can reduce the image size without sacrificing quality by using the latest image formats (like .webp and .avif) and prevent layout shift by explicitly setting the image width and height.

Edge Caching

Since we want our framework to generate a static HTML file for this page, we can use a CDN to improve the Time To First Byte (TTFB) by caching the file at each region (or edge). Vercel provides this functionality out of the box with the Edge Network, so we don't need to add this ourselves.

### Products Page
Demo website's product page
Demo website's product page
The products page is a hybrid between a pre-generated static HTML page and a dynamic server-rendered page. The page renders a list of products retrieved from a data provider and should automatically update after a certain amount of time (or when new products have been added).

This product page can benefit from a few optimizations we want to build into our framework. 

Image Optimization

Since we're showing many images on this page, we want to use image optimization to serve the images in the latest format and defer the loading of non-critical images for a faster first paint.

Incremental Static Regeneration

Displayed products should update after a certain amount of time or when new products are added. This rendering pattern is also referred to as Incremental Static Regeneration behavior and gives you the benefits of Static Generation, combined with the dynamic benefits of Server-Side Rendering. When using the Build Output API, we can use Prerender Functions to enable and configure ISR on certain pages.

### Popular Page
Demo website's popular page
Demo website's popular page
We want to display the most relevant, personalized products to our visitors. How can our web framework help enable us to add this feature?

Edge Functions

To get the visitor’s location, we can use an Edge Function to determine the city based on the x-vercel-ip-city header. We could take two approaches to Edge Functions: either use Edge Middleware to redirect the user to a specific page based on their location, or we can server-render the page using Edge Functions. We’ll choose server-rendering for a fast, personalized page in this case.


## Building the framework
We now know what features our website could benefit from to create a better user experience. Next, let’s focus on implementing our framework to ensure it supports all the features mentioned above.

Our framework expects the pages to be located in the pages/ folder. To keep it simple, we’ll expect that the page contains:

A default export to export the page’s React component
A configuration object named pageConfig, which includes a strategy prop to define the rendering technique that should be used for this page - either static, ssr, prerender, or edge . If a page is prerendered, users can also pass an optional  expiration time and fallback component to configure the regeneration
Let's see how our framework can work with these values and create a valid output Vercel can use to deploy our project.

## Static Rendering
When a page is statically rendered, the page’s HTML is generated during the build. Vercel's Edge Network can quickly return this pre-generated HTML file when a user visits the page, after which the browser can draw the contents to the user’s screen.

To support static pages, we first have to implement a transpilation step that turns React-based pages into static HTML. ReactDOM Server exposes a method called renderToString, which takes a React component and returns the corresponding HTML output. We can invoke this function to prerender the HTML for static pages during the build.
```
function createStaticPage(pagePath) {
  const { Component } = require(pagePath);
  const pageHTML = `<div id="root">${ReactDOMServer.renderToString(Component)</div>`;
  ...
}
```
In most cases, however, our React components aren’t entirely static. Components usually contain some interactivity, such as event handlers. To account for this, we also need to create one or multiple JavaScript bundle(s) to hydrate the static markup once it’s been rendered.

To hydrate dynamic components, we can export a string literal that our bundler eventually uses to create a custom hydration script for the individual pages. A bundler can generate HTML and automatically inject this custom hydration script as a deferred script. The script automatically fetches the hydration bundle to add interactivity when a browser has loaded the page's HTML.

Group 17.png
Let’s see what this could look like in our code.

The example below shows a dynamic createStaticFile method that takes our page’s default exported component and the filePath where the component is located. With this information, we can create a bundle that automatically gets injected into the newly created HTML file and output it to the .vercel/output/static folder.
```
export async function createStaticFile(Component,filePath) {
  const pageName = getPageName(filePath);
  const outdir = join(".vercel", "output", "static");
  await fs.ensureDir(outdir);
 
  await generateClientBundle({ filePath, outdir, pageName });
  
  return fs.writeFileSync(
    path.join(outdir, `${pageName}.html`),
    `<!DOCTYPE html>
      ...
      <body>
        <div id="root">${ReactDOMServer.renderToString(React.createElement(Component) )}</div>
        <script src="${pageName}.bundle.js" defer></script>
      </body>`
  );
}
```

At build time, we end up with a .vercel/output/static folder that contains the static HTML and the JavaScript bundle(s) necessary for hydration.

Folder structure for static assets
Folder structure for static assets
Any static assets, such as HTML, CSS, JavaScript, and images should be located in the .vercel/output/static folder so the Vercel Build Output API can convert them into infrastructure primitives.

### Incremental Static Regeneration
Incremental Static Regeneration is a powerful pattern that we can use for pages that contain data that frequently updates by invalidating the cache and regenerating the page after a specific interval or based on an event.

The /products page can benefit from ISR, as it could regenerate after a specific interval to ensure it always shows the latest products and optional price reductions as quickly as possible.

Group 18.png
To enable Incremental Static Regeneration, we need to create a few files.

products.func/index.js: A Serverless Function containing the handler that takes care of the page’s (re)generation.
products.func/vc-config.js: The configuration file used by the Serverless Function to configure its environment, such as the runtime and optional helpers.
products.prerender-config.json: The configuration file that Vercel uses to determine when and how to regenerate the page. This is necessary since this isn’t just Server-Rendering—it’s also using automatic invalidation and regeneration.
products.prerender-fallback.html: The (optional) fallback HTML that gets served when there’s no cached version of the page available yet and the page is being generated in the background. This creates a better user experience since users don’t have to stare at a blank screen while the page is generated.


### Serverless Functions
First, let’s see how we can create a Serverless Function that handles the HTML (re)generation.

When a Serverless Function is invoked, its handler function runs. This function runs in its own environment, meaning that we have to ensure that this handler function has access to all the necessary code to generate the HTML.

We can create a Serverless Function on Vercel by creating a <name>.func folder, with the name being the name of the server-rendered page. In this case, we have to create a products.func folder, since the page needs to get regenerated in a Serverless Function.

To include all the necessary code and dependencies, we can create a node_modules folder within the function folder or bundle everything together into one single handler file.

Group 21.png
To create the files that are necessary for a serverless function, let’s create a createServerlessFunction function that invokes two functions:

generateClientBundle, to generate a client-side bundle used to hydrate the static HTML returned from the server
generateLambdaBundle, to bundle the necessary files into a script that’s executed in the Lambda’s handler
The method also generates a .vc-config.json file, which includes information that the Lambda needs to set up its execution context.
```
export async function createServerlessFunction(Component, filePath) {
  const pageName = getPageName(filePath);
  const funcFolder = `.vercel/output/functions/${pageName}.func`;

  await fs.ensureDir(funcFolder);

  await Promise.allSettled([
    generateClientBundle({ filePath, pageName }),
    generateLambdaBundle({
      funcFolder,
      pageName,
      Component,
    }),
  ]);

  return fs.writeJson(`${funcFolder}/.vc-config.json`, {
    runtime: "nodejs16.x",
    handler: "index.js",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
  });
}
```

The handler function is responsible for server-rendering the HTML based on the page’s exported component. This approach is very similar to the static rendering we saw before. This time, however, we’re generating the HTML at request time instead of at build time.
```
export async function generateLambdaBundle(Component, funcFolder, pageName,outfile) {
  const html = ReactDOMServer.renderToString(React.createElement(Component)); 
  const { code: contents } = await transform(getHandlerCode(html, pageName));

  return await build({
    ...
    stdin: { contents, resolveDir: path.join(".") },
    outfile,
  });
};

const getHandlerCode = (html: string, pageName: string) => `
  export default (req, res) => {  
    res.setHeader('Content-type', 'text/html');
    res.end(\`<!DOCTYPE html>
    <html lang="en">
      ...
      <body>
        <div id="root">${html}</div>
        <script src="${pageName}.bundle.js" defer></script>
      </body>
    </html>\`)
  }
`;
```

After bundling, the .vercel/output/functions/products.func/index.js handler file includes the functionality to server-render the component’s HTML.

Besides creating a Serverless Function, we also need a prerender-config.json file that contains information about the regeneration when we’re using Incremental Static Regeneration. Our framework allows the users to set their own revalidate time, so we can dynamically create this config file.

Our new createPrerender function calls the createServerlessFunction and createStaticFile functions that we created before, and creates a <name>.prerender-config.json. We’re creating a static file to render this as a fallback page.  This page gets shown to the user when the page is still being generated in the background.  The Build Output API expects this fallback HTML to be located at <name>.prerender-fallback.html , or as specified in the <name>.prerender-config.json.

```
export async function createPrerender(Component, filePath, pageConfig) {
  const pageName = getPageName(filePath);

  const funcFolder = `.vercel/output/functions/${pageName}.func`;
  await fs.ensureDir(funcFolder);

  await Promise.allSettled([
    createServerlessFunction(Component, filePath),
    createStaticFile(Component, filePath, {
      outdir: `.vercel/output/functions`,
      fileName: `${pageName}.prerender-fallback.html`,
      bundle: false,
    }),
  ]);

  return writeJson(
    `.vercel/output/functions/${pageName}.prerender-config.json`,
    {
      expiration: pageConfig.revalidate,
      group: 1,
      fallback: `${pageName}.prerender-fallback.html`,
    }
  );
}
```

Once building has been completed, we end up with a products.func folder containing all the code it needs to generate the HTML on the server.

### Folder structure for prerender functions
Folder structure for prerender functions
Right now, the createPrerender function takes care of creating the Serverless Function, creating a static prerender-fallback.html fallback file by statically rendering the component at build time, and generating a prerender-config.json configuration file that includes the necessary information the Build Output API needs to configure the prerendering behavior, such as the expiration value.

### Edge Server-Rendering
Since React is compatible with the Edge Runtime due to its isomorphic nature - it doesn’t use any Node.js libraries - it’s possible to render React at the Edge. Creating an Edge Function is similar to a serverless function, with its runtime as the most significant difference.

Group 35.png
Let’s create a createEdgeFunction function that takes care of generating the necessary files to enable Edge Server-Rendering. This function calls the generateEdgeBundle function that eventually takes care of bundling the required files, and creates a .vc-config.json configuration file that indicates we’re using the edge runtime with an entrypoint file instead of a handler.

```
export async function createEdgeFunction(Component, filePath) {
  const pageName = getPageName(filePath);
  const funcFolder = `.vercel/output/functions/${pageName}.func`;
  await ensureDir(funcFolder);

  await generateEdgeBundle({
    funcFolder,
    filePath,
    pageName,
    Component,
  });

  return writeJson(`${funcFolder}/.vc-config.json`, {
    runtime: "edge",
    entrypoint: "index.js",
  });
}
```

Generating the bundle is similar to the serverless approach, however this time, we care about values present on the req object. To pass the prop down to the edge-rendered page, we can dynamically create the React element that was bundled from the original page’s file path.

```
export async function generateEdgeBundle(funcFolder, pageName, filePath) {
  const { code: contents } = await transform(
    getEdgeHandlerCode(filePath),
    edgeBuildConfig
  );

  return await build({
    ...
    stdin: { contents, resolveDir: path.join(".") },
    outfile,
  });
}

export const getEdgeHandlerCode = (filePath) => `
  import { createElement } from 'react';
  import { renderToString } from 'react-dom/server';
  import Component from '${filePath}';

  export default async function(req) {
    const html = renderToString(createElement(Component, { req }));

    return new Response(\`<!DOCTYPE html><div id="root">${html}</div>\`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
`;
```

After bundling, we now end up with an entrypoint that passes the req prop to the edge-rendered page and returns a new Response object with the generated HTML.

### Serverless Functions
Serverless Functions can be used to server-render pages or to create data fetching endpoints.

When we implemented Incremental Static Regeneration in the previous paragraph, we created a Serverless Function responsible for generating the page’s HTML. Server-Side Rendering uses the same approach - with the main differences being when the Serverless Function gets invoked and its caching behavior. To server-render a page, we need to create a function that generates the page’s HTML on every request.

Group 19.png
You can see that it’s essentially a subset of the Incremental Static Regeneration code. In this case, we’re only calling the createServerlessFunction method covered in the previous paragraph to create both a lambda (serverless) bundle and a client-side bundle.

With ISR, this lambda only gets invoked when a user requests a page that had been cached longer than the revalidate value. Vercel then automatically regenerates the page.

With server-side rendering, however, this function is invoked on every request. Vercel won’t automatically cache responses from this function when the page is server-rendered, resulting in unique responses every time.

Now that we’re supporting the rendering techniques, let’s see how to implement Image Optimization.

### Automatic Image Optimization
Vercel can automatically optimize images by pointing the image src to /_vercel/image?url=  and adding the necessary configuration. For our framework, we'll add support for a vercel.config.js file, where the Image Optimization configuration can be defined.

Let’s make it easy for our users to use optimized images by exporting an Image component. This component ensures that the src point to the /_vercel/image path and adds the necessary height and width to serve the correct image size based on the viewport.

```
export const Image = (props) => {
  return  (
    <img 
      {...props} 
      ref={ref} 
      width={props.width} 
      height={props.height} 
      src={`/_vercel/image?url=${encodeURIComponent(props.src)}&w=${props.width}&q=75`} 
   />
  )
}
```
You can now import the Image component and use it like a regular img tag. The only part required is some configuration in the vercel.config.js file, such as the domain if it’s an external domain, the image size, and the modern image format we want to use. This file is used by our framework and outputs its contents to .vercel/output/config.json.
```
// vercel.config.json 
export default {
  images: {
    domains: [...], 
    sizes: [...],
    minimumCacheTTL: 60,
    formats: [
      "image/webp",
      "image/avif"
    ]
  }
}
```
After adding this configuration, any image that uses our custom Image component can benefit from the Automatic Image Optimization feature Vercel provides.

## Conclusion
Now that we have the necessary methods to support the rendering patterns and optimize images, we can traverse the pages directory and invoke the functions to create the required files. We’re also copying all the static files - such as images, CSS, and JavaScript - from the project’s public folder to the .vercel/output/static folder and creating a .vercel/output/config.json file based on the project’s vercel.config.js.

```
async function buildVercelOutput() {
  ...
  await Promise.allSettled(
    getRoutes().map(async (filePath) => {
      const { pageConfig, default: Component } = await import(filePath);

      switch (pageConfig.strategy) {
        case "static":
          return createStaticFile(Component, filePath);
        case "prerender":
          return createPrerender(Component, filePath, pageConfig);
        case "ssr":
          return createServerlessFunction(Component, filePath);
        case "edge":
          return createEdgeFunction(Component, filePath);

        default:
          return;
      }
    })
  );

  await copy("public", ".vercel", "output", "static")

  return writeJSON(".vercel/output/config.json", {
    ...(require(process.cwd() + "/vercel.config.js").default),
    ...{
      version: 3,
      routes: getTransformedRoutes({
         cleanUrls: true
      }).routes,
    },
  });
  ...
}
```

When invoking this method, we can create a valid .vercel/output folder that allows us to deploy to Vercel, using some of the cutting-edge features that the platform provides.

When using modern frameworks such as Next.js, we luckily don’t have to worry about implementing all these steps since the optimizations are provided out of the box.

However, if you’re an independent developer that wants to benefit from the platform’s features or a framework author that’s looking to integrate with Vercel, the Build Output API makes it easy to build any project on Vercel.

Although it should be clear that this framework should not be used in production—it just does the bare minimum and can be optimized—it’s good to see how modern frameworks make development so much easier.

