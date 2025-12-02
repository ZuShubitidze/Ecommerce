import type { RootState } from "@/store/store";
import Products from "@/components/Products";
import { useSelector } from "react-redux";

const ProductsPage = () => {
  const { data } = useSelector((state: RootState) => state.products);

  return (
    <div>
      <section className="flex flex-wrap justify-center gap-6 py-10 md:py-15">
        {data?.products.map((product) => (
          <Products
            key={product.id}
            id={product.id}
            category={product.category}
            description={product.description}
            images={product.images}
            price={product.price}
            title={product.title}
          />
        ))}
      </section>
    </div>
  );
};

export default ProductsPage;
