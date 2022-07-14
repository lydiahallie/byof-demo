import { Layout } from "../components/Layout";
import { Image } from "../lib/components/Image";

export default function Index() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        <main className="flex flex-col items-center justify-between pt-10">
          <div className="flex flex-col items-center flex-1 px-4 sm:px-20 text-center z-10 sm:pt-10 mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold text-center">
              Shop the latest Vercel merchandise
            </h1>
            <p className="mt-4 sm:text-xl text-lg text-gray-700">
              Shop the latest Vercel and Next.js merch for the best price
            </p>
          </div>
          <Image src="/landing-white.png" height={600} width={750} />
        </main>
      </div>
    </Layout>
  );
}

export const pageConfig = {
  strategy: "static",
};
