import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  // console.log(latestProducts);

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList
        limit={4}
        // data={sampleData.products}
        data={latestProducts}
        title="Newest arrivals"
      />
    </>
  );
};

export default HomePage;
