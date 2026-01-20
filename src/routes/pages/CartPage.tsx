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
      <h2 className="flex justify-center text-3xl font-bold mb-20">
        Your Shopping Cart
      </h2>
      {cartProducts.length === 0 ? (
        // Empty Cart
        <p className="text-2xl">
          Your cart is empty.
          <Link to="/products" className="text-blue-500 font-bold ml-2">
            Start shopping!
          </Link>
        </p>
      ) : (
        <section className="flex flex-col gap-6">
          {/* Header row - visible on md+ so labels align with the item columns */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b font-semibold">
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1" /> {/* spacer for remove button */}
          </div>

          {/* Items */}
          {cartProducts.map((product) => (
            // Cart product details
            <div key={product.id}>
              <CartItem product={product} />
            </div>
          ))}
          <Button onClick={handleClearCart} className="w-30">
            Clear Cart
          </Button>
          {/* Total and checkout */}
          <div className="mt-10 flex gap-10 justify-center items-center">
            <h3>Total: ${totalAmount.toFixed(2)}</h3>
            <Link to="/cart/checkout">
              <Button>Proceed to Checkout</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;
