import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  console.log(latestProducts);

  return (
    <>
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
