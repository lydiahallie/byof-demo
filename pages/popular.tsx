import { Grid } from "../components/Grid";
import { Layout } from "../components/Layout";
import products from "../data";

export default function Popular({ req }) {
  const parsedCity = decodeURIComponent(req.headers.get("x-vercel-ip-city"));
  const city = parsedCity === "null" ? null : parsedCity;

  return (
    <Layout>
      <div className="flex flex-col justify-center py-10 bg-white">
        <div className="fixed inset-0 overflow-hidden opacity-75 bg-[#F7F7F7]"></div>
        <main className="flex flex-col items-center flex-1 px-4 sm:px-20  z-10 sm:pt-10">
          <h1 className="text-3xl sm:text-5xl font-bold">Popular in {city}</h1>
          <p className="mt-4 sm:text-xl text-lg text-gray-700">
            Shop what's currently trending in your area
          </p>
          <Grid>
            {products.reverse().map((product) => (
              <div className="cursor-pointer" key={product.id}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-[480px] transition">
                  <img
                    alt="Black shirt with white logo"
                    src={product.src}
                    width="512"
                    height="512"
                  />
                </div>
                <section className="py-3">
                  <div className="flex flex-col justify-center items-center">
                    <div className="ml-5 mr-5 w-full text-left flex justify-between items-baseline">
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <h5 className="text-gray-700 font-regular text-sm">
                        ${product.price}
                      </h5>
                    </div>
                  </div>
                </section>
              </div>
            ))}
          </Grid>
        </main>
      </div>
    </Layout>
  );
}

export const pageConfig = {
  strategy: "edge",
};
