import {
  selectCartError,
  selectCartLoading,
  selectCartProducts,
  selectCartTotal,
} from "@/store/cart/cartSlice";
import { useSelector } from "react-redux";

export const useCartData = () => {
  const cartProducts = useSelector(selectCartProducts);
  const total = useSelector(selectCartTotal);
  const count = cartProducts.length;
  const error = useSelector(selectCartError);
  const loading = useSelector(selectCartLoading);

  return { cartProducts, total, count, error, loading };
};
