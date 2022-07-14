export default function Index() {
  return <h1>This is my server-rendered page</h1>;
}

export const pageConfig = {
  strategy: "ssr",
};
