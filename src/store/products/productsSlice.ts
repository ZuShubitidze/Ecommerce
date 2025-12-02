import type { Product } from "@/store/products/interfaces/product.interface";
import {
  createSlice,
  createAction,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface FirestoreProductsData {
  products: Product[];
}

// Products slice state interface
interface ProductsState {
  data: FirestoreProductsData;
  loading: boolean;
  error: string | null;
}

// Initial state for products slice
const initialState: ProductsState = {
  data: {
    products: [],
  },
  loading: false,
  error: null,
};

// Action Types from subscribeToProducts
export const productsRequest = createAction("FETCH_PRODUCTS_REQUEST");
export const productsSuccess = createAction<Product[]>(
  "FETCH_PRODUCTS_SUCCESS"
);
export const productsFailure = createAction<string>("FETCH_PRODUCTS_FAILURE");

// Products slice definition
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(productsRequest, (state) => {
        // Use the action creator directly
        state.loading = true;
        state.error = null;
      })
      .addCase(productsSuccess, (state, action: PayloadAction<Product[]>) => {
        // Use the action creator directly
        state.loading = false;
        state.data.products = action.payload;
        // If you need 'total', calculate it here:
        // state.data.total = action.payload.length;
      })
      .addCase(productsFailure, (state, action: PayloadAction<string>) => {
        // Use the action creator directly
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
