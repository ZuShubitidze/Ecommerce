import React from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "@/routes/auth/AuthContext"; // Assuming you get user here"
import {
  removeCartProductFromFirestore,
  updateCartProductQuantityInFirestore,
} from "@/store/cart/cartSlice";
import type { FavoriteProductData } from "@/store/favorites/interfaces/favorites.interface";
import type { AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  product: FavoriteProductData;
}
const CartItem: React.FC<CartItemProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth(); // Get current user

  // Increment product quantity
  const handleIncrement = () => {
    if (user?.uid && product.quantity !== undefined) {
      dispatch(
        updateCartProductQuantityInFirestore(
          user.uid,
          product.id,
          product.quantity + 1
        )
      );
    }
  };

  // Decrement product quantity
  const handleDecrement = () => {
    if (user?.uid && product.quantity !== undefined) {
      const newQuantity = product.quantity - 1;
      if (newQuantity <= 0) {
        // If quantity becomes 0, remove the item
        dispatch(removeCartProductFromFirestore(user.uid, product.id));
      } else {
        dispatch(
          updateCartProductQuantityInFirestore(
            user.uid,
            product.id,
            newQuantity
          )
        );
      }
    }
  };

  // Optional: direct input field
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.uid) {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        if (value <= 0) {
          dispatch(removeCartProductFromFirestore(user.uid, product.id));
        } else {
          dispatch(
            updateCartProductQuantityInFirestore(user.uid, product.id, value)
          );
        }
      }
    }
  };

  if (!product.quantity) return null; // Should not happen if added correctly

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <h4>{product.title}</h4>
      <p>Price: ${product.price.toFixed(2)}</p>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button onClick={handleDecrement}>-</Button>
        <Input
          type="number"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-10 text-center"
          value={product.quantity}
          onChange={handleQuantityChange}
          min="1"
        />
        <Button onClick={handleIncrement}>+</Button>
      </div>
      <p>Subtotal: ${(product.price * product.quantity).toFixed(2)}</p>
      <Button
        onClick={() =>
          user?.uid &&
          dispatch(removeCartProductFromFirestore(user.uid, product.id))
        }
      >
        Remove
      </Button>
    </div>
  );
};

export default CartItem;
