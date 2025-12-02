import type { User } from "firebase/auth";
import React from "react";
import {
  addCartProductToFirestore,
  removeCartProductFromFirestore,
} from "../cartSlice";
import type { FavoriteProductData } from "@/store/favorites/interfaces/favorites.interface";

export const handleToggleCart = (
  event: React.MouseEvent,
  isInCart: boolean,
  user: User | null,
  id: string,
  dispatch: any,
  cartProductData: FavoriteProductData
) => {
  event.stopPropagation();

  // User not logged in
  if (!user) {
    alert("Please log in to manage cart");
    return;
  }

  // Dispatch actions
  if (isInCart) {
    dispatch(removeCartProductFromFirestore(user.uid, id));
  } else {
    dispatch(addCartProductToFirestore(user.uid, cartProductData));
  }
};
