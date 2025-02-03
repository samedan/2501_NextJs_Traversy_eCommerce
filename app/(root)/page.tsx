import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

const HomePage = () => {
  return (
    <>
      <ProductList
        limit={4}
        data={sampleData.products}
        title="Newest arrivals"
      />
    </>
  );
};

export default HomePage;
