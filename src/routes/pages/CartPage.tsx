import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { clearCart, clearCartInFirestore } from "@/store/cart/cartSlice";
import CartItem from "./CartItem";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/store/store";
import { useCartData } from "@/hooks/useCartData";

const CartPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cartProducts, total, error, loading } = useCartData();

  if (loading) {
    console.log(cartProducts);
    return <div>Loading cart...</div>;
  }

  if (error) {
    return <div>Error loading cart: {error}</div>;
  }

  // Clear cart handler
  const handleClearCart = async () => {
    if (user?.uid) {
      // Dispatch the thunk to clear Firestore
      await dispatch(clearCartInFirestore(user.uid) as any);
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
            <h3>Total: ${total.totalAmount.toFixed(2)}</h3>
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
