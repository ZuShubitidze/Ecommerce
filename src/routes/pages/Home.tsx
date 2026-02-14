import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useProducts } from "@/hooks/useProducts";
import { CarouselComponent } from "@/components/CarouselComponent";

export function HydrateFallback() {
  return <p>Loading application...</p>;
}

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { products, loading: productsLoading } = useProducts();

  // Filter products for carousel
  const carouselProducts = products?.slice(0, 5) || [];

  return (
    <>
      {productsLoading && products.length === 0 ? (
        <div className="py-20 text-center">Loading products...</div>
      ) : (
        <CarouselComponent
          products={products}
          carouselProducts={carouselProducts}
          user={user}
        />
      )}
    </>
  );
};

export default Home;
