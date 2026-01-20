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
  const { user } = useAuth();

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

  // Direct input field
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

  if (!product.quantity) return null;

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b">
      {/* Product title / image */}
      <div className="col-span-12 md:col-span-4">
        {product.images && product.images[0] && (
          <img src={product.images[0]} alt={product.title} />
        )}
        <h4 className="font-medium">{product.title}</h4>
      </div>

      {/* Price */}
      <div className="col-span-6 md:col-span-2 text-right">
        <p className="text-sm text-gray-700 font-bold">
          ${product.price.toFixed(2)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="col-span-6 md:col-span-3 flex items-center justify-center gap-2">
        <Button
          size="sm"
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          -
        </Button>

        <Input
          type="number"
          className="w-16 text-center p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={product.quantity}
          onChange={handleQuantityChange}
          min={1}
          inputMode="numeric"
        />

        <Button
          size="sm"
          onClick={handleIncrement}
          aria-label="Increase quantity"
        >
          +
        </Button>
      </div>

      {/* Subtotal */}
      <div className="col-span-12 md:col-span-2 text-right">
        <p className="font-medium">
          ${(product.price * product.quantity).toFixed(2)}
        </p>
      </div>

      {/* Remove button */}
      <div className="col-span-12 md:col-span-1 flex md:justify-end justify-start">
        <Button
          variant="ghost"
          onClick={() =>
            user?.uid &&
            dispatch(removeCartProductFromFirestore(user.uid, product.id))
          }
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
