import type { AppDispatch, RootState } from "@/store/store";
import Products from "@/components/Products";
import { useDispatch, useSelector } from "react-redux";
import { selectCartProducts, selectCartTotal } from "@/store/cart/cartSlice";
import { useEffect, useRef } from "react";
import {
  fetchInitialProducts,
  fetchMoreProducts,
} from "@/store/products/productsSlice";
import type { DocumentSnapshot } from "firebase/firestore";

const ProductsPage = () => {
  const dispatch: AppDispatch = useDispatch();
  // lastVisibleDoc is no longer in the Redux state, so we remove it from destructuring
  const { products, hasMore, loading } = useSelector(
    (state: RootState) => state.products,
  );
  // const user = useAuth().user;
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (authLoading) return null;

  // Use a ref to store the last DocumentSnapshot, which persists across renders
  const lastVisibleDocRef = useRef<DocumentSnapshot | null>(null);

  const cartProducts = useSelector(selectCartProducts);
  const { totalAmount } = useSelector(selectCartTotal);
  const productsList = products || [];
  console.log(totalAmount, cartProducts, cartProducts.length);

  useEffect(() => {
    // Fetch initial products only once when the component mounts and if the products list is empty.
    // This assumes Redux state persists; otherwise, you might need a different flag.
    if (productsList.length === 0 && !loading) {
      const getInitialProducts = async () => {
        // Dispatch the thunk and unwrap the result to get its payload
        const result = await dispatch(fetchInitialProducts()).unwrap();
        // Store the lastVisibleDoc from the payload into the ref
        lastVisibleDocRef.current = result.lastVisible;
      };
      getInitialProducts();
    }
  }, [dispatch, productsList.length, loading]); // Added productsList.length and loading to dependencies for robust initial fetch logic

  const handleLoadMore = async () => {
    // Made async to await the thunk result
    // Only load more if there are more products, not currently loading, and we have a last visible document in the ref
    if (hasMore && !loading && lastVisibleDocRef.current) {
      // Dispatch the thunk, passing the lastVisibleDoc from the ref
      const result = await dispatch(
        fetchMoreProducts(lastVisibleDocRef.current),
      ).unwrap();
      // Update the ref with the new lastVisibleDoc from the fetched result
      lastVisibleDocRef.current = result.lastVisible;
    }
  };

  return (
    <section className="flex flex-wrap justify-center p-10 gap-10 md:py-15">
      {productsList?.map((product) => (
        <Products
          key={product.id}
          id={product.id}
          category={product.category}
          description={product.description}
          images={product.images}
          price={product.price}
          title={product.title}
          user={user}
        />
      ))}
      {loading && productsList.length > 0 && <p>Loading more products...</p>}{" "}
      {/* Show loading only when new products are being fetched, and existing products are already displayed */}
      {hasMore && !loading && (
        <div className="w-full text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Load More
          </button>
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
