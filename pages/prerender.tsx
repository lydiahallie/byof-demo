export default function Index() {
  return <h1>This is my prerenderd page</h1>;
}

export const pageConfig = {
  strategy: "prerender",
  revalidate: 600,
};
