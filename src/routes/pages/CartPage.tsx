import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
  selectCartProducts,
  selectCartLoading,
  selectCartError,
  selectCartTotal,
  clearCart,
  clearCartInFirestore,
} from "@/store/cart/cartSlice";
import CartItem from "./CartItem";
import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/AuthContext";

const CartPage = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const cartProducts = useSelector(selectCartProducts);
  const { totalAmount } = useSelector(selectCartTotal);
  const { user } = useAuth();

  console.log(
    "CartPage - loading:",
    loading,
    "error:",
    error,
    "cartProducts:",
    cartProducts,
    "totalAmount:",
    totalAmount
  );
  if (loading) {
    console.log(cartProducts);
    return <div>Loading cart...</div>;
  }

  if (error) {
    return <div>Error loading cart: {error}</div>;
  }

  // <--- Create a handler for clearing the cart
  const handleClearCart = async () => {
    if (user?.uid) {
      await dispatch(clearCartInFirestore(user.uid) as any); // Dispatch the thunk to clear Firestore
    } else {
      console.warn("Cannot clear cart: User not logged in.");
      dispatch(clearCart());
    }
  };

  return (
    <div className="py-10">
      <h2 className="flex justify-center text-3xl font-bold">
        Your Shopping Cart
      </h2>
      {cartProducts.length === 0 ? (
        // Empty Cart
        <p>Your cart is empty. Start shopping!</p>
      ) : (
        <>
          {cartProducts.map((product) => (
            // Cart product details
            <div key={product.id}>
              <CartItem product={product} />
            </div>
          ))}
          <Button onClick={handleClearCart}>Clear Cart</Button>
          {/* Total and checkout */}
          <section className="mt-10 flex gap-10 justify-center">
            <h3>Total: ${totalAmount.toFixed(2)}</h3>
            <Link to="/cart/checkout">
              <Button>Proceed to Checkout</Button>
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default CartPage;
