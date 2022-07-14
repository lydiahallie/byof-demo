import Nav from "./Nav";

export function Layout({ children }: { children?: any }) {
  return (
    <div className="mx-auto h-screen flex flex-col bg-[#F7F7F7]">
      <Nav />
      <div className="px-8 bg-accents-0">{children}</div>
    </div>
  );
}
