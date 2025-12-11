import type { RootState } from "@/store/store";
import Products from "@/components/Products";
import { useSelector } from "react-redux";
import { selectCartProducts, selectCartTotal } from "@/store/cart/cartSlice";
import { useAuth } from "../auth/AuthContext";

const ProductsPage = () => {
  const { data } = useSelector((state: RootState) => state.products);
  const user = useAuth().user;

  const cartProducts = useSelector(selectCartProducts);
  const { totalAmount } = useSelector(selectCartTotal);
  console.log(totalAmount, cartProducts, cartProducts.length);

  return (
    <section className="flex flex-wrap justify-center p-10 gap-10 md:py-15">
      {data?.products.map((product) => (
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
    </section>
  );
};

export default ProductsPage;
