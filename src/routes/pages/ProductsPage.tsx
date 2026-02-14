import type { RootState } from "@/store/store";
import Products from "@/components/Products";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const ProductsPage = () => {
  const { products, loading, hasMore, loadMore } = useProducts();
  const { user } = useSelector((state: RootState) => state.auth);

  const productsList = products || [];
  return (
    <section className="flex flex-wrap justify-center p-10 gap-10 md:py-15">
      {productsList?.map((product) => (
        <Products key={product.id} {...product} user={user} />
      ))}
      {loading && productsList.length > 0 && <p>Loading more products...</p>}{" "}
      {hasMore && (
        <div className="w-full text-center mt-8">
          <Button
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
            onClick={loadMore}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
      {!hasMore && productsList.length > 0 && !loading && (
        <div className="w-full text-center mt-8">
          <p>You've seen all products!</p>
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
