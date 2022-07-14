import cn from "clsx";

export default function Nav() {
  return (
    <nav
      className={cn("border-b border-gray-200 py-5 relative z-20 bg-white", {
        boxShadow: "0 0 15px 0 rgb(0 0 0 / 10%)",
      })}
    >
      <div
        className={cn("flex items-center lg:px-6 px-8 mx-auto max-w-7xl px-14")}
      >
        <div className="flex flex-row items-center">
          <span>
            <svg height="26" viewBox="0 0 75 65" fill="#000">
              <title>Vercel Logo</title>
              <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
            </svg>
          </span>
          <ul className="flex items-center content-center">
            <li className="ml-2 text-gray-200">
              <a href="/">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  shapeRendering="geometricPrecision"
                ></svg>
              </a>
            </li>
            <li className="font-medium" style={{ letterSpacing: ".01px" }}>
              <a href="/">Vercel Products</a>
            </li>
          </ul>
        </div>
        <div className="flex-1 justify-end hidden md:flex">
          <nav className="flex-row inline-flex items-center">
            <span className="ml-2 h-full flex items-center cursor-not-allowed text-accents-5">
              <a style={{ margin: "0 .5em" }} href="/">
                Home
              </a>
              <a style={{ margin: "0 .5em" }} className="mx-2" href="/products">
                Products
              </a>
              <a style={{ margin: "0 .5em" }} className="mx-2" href="/popular">
                Popular
              </a>
            </span>
            <span className="ml-2 h-full flex items-center cursor-not-allowed text-accents-5"></span>
          </nav>
        </div>
      </div>
    </nav>
  );
}
