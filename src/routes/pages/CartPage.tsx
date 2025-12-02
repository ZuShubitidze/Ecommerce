import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const CartPage = () => {
  const cart = useSelector((state: RootState) => state.cart.cartProducts);
  console.log(cart);

  return (
    <div>
      <h1>Cart</h1>
      {cart.map((cart) => (
        <div key={cart.id}>
          <h1>{cart.title}</h1>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
