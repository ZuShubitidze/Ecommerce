import { useAppDispatch } from "@/store/hooks";
import {
  fetchInitialProducts,
  fetchMoreProducts,
} from "@/store/products/productsSlice";
import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useProducts = () => {
  const dispatch = useAppDispatch();

  const { products, loading, error, hasMore } = useSelector(
    (state: RootState) => state.products,
  );

  useEffect(() => {
    if (products.length === 0 && !loading) {
      dispatch(fetchInitialProducts());
    }
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      dispatch(fetchMoreProducts());
    }
  };

  return { products, loading, error, hasMore, loadMore };
};
