import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProductDetail from "@/routes/pages/ProductDetail";

/**
 * Mocks MUST be declared before importing the component under test.
 *
 * Strategy:
 * - Provide a real Redux Provider with a small store containing products, favorites and cart slices.
 * - Mock UI primitives (Card, Button) to keep the DOM simple and stable.
 * - Mock useParams to return the product id and mock useAuth to control user presence.
 * - Import ProductDetail after mocks and assert rendered product details.
 */

/* Mock ui/card primitives used by ProductDetail */
vi.mock("@/components/ui/card", () => {
  return {
    __esModule: true,
    Card: ({ children, ...props }: any) => (
      <div data-testid="card" {...props}>
        {children}
      </div>
    ),
    CardAction: ({ children, ...props }: any) => (
      <div data-testid="card-action" {...props}>
        {children}
      </div>
    ),
    CardContent: ({ children, ...props }: any) => (
      <div data-testid="card-content" {...props}>
        {children}
      </div>
    ),
    CardFooter: ({ children, ...props }: any) => (
      <div data-testid="card-footer" {...props}>
        {children}
      </div>
    ),
    CardHeader: ({ children, ...props }: any) => (
      <div data-testid="card-header" {...props}>
        {children}
      </div>
    ),
    CardTitle: ({ children, ...props }: any) => (
      <h2 data-testid="card-title" {...props}>
        {children}
      </h2>
    ),
  };
});

/* Mock Button so it's a plain button */
vi.mock("@/components/ui/button", () => {
  return {
    __esModule: true,
    Button: ({ children, ...props }: any) => (
      <button data-testid="mock-button" {...props}>
        {children}
      </button>
    ),
  };
});

/* Mock react-router useParams to return { id: "1" } */
vi.mock("react-router", () => {
  return {
    __esModule: true,
    useParams: () => ({ id: "1" }),
  };
});

/* Mock auth hook — tests will control whether user exists by changing this mock's return if needed.
   For these render-only tests we return null user to avoid rendering CardAction buttons. */
vi.mock("../auth/AuthContext", () => {
  return {
    __esModule: true,
    useAuth: () => ({ user: null }),
  };
});

/* Now import the component under test AFTER mocks */

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* Helper to create a store with products, favorites and cart slices */
function makeStore(
  preloadedProductsState: any,
  preloadedFavoritesState = { favorites: [] },
  preloadedCartState = { cartProducts: [] }
) {
  const productsReducer = (state = preloadedProductsState) => state;
  const favoritesReducer = (state = preloadedFavoritesState) => state;
  const cartReducer = (state = preloadedCartState) => state;

  return configureStore({
    reducer: {
      products: productsReducer,
      favorites: favoritesReducer,
      cart: cartReducer,
    },
    preloadedState: {
      products: preloadedProductsState,
      favorites: preloadedFavoritesState,
      cart: preloadedCartState,
    },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

describe("ProductDetail", () => {
  it("renders the product details matching the id param", () => {
    const product = {
      id: "1",
      title: "Test Product",
      category: "Gadgets",
      description: "Great gadget",
      images: ["https://example.com/img.jpg"],
      price: 99.99,
      rating: 4.5,
      reviews: [
        { reviewerName: "Alice", rating: 5, comment: "Loved it" },
        { reviewerName: "Bob", rating: 4, comment: "Good" },
      ],
    };

    const store = makeStore({ products: [product] });

    render(
      <Provider store={store}>
        <ProductDetail />
      </Provider>
    );

    // Title rendered inside CardTitle
    expect(screen.getByTestId("card-title")).toHaveTextContent("Test Product");

    // Price, category and description
    expect(screen.getByText(/Price:\s*\$99\.99/)).toBeInTheDocument();
    expect(screen.getByText(/Category:\s*Gadgets/)).toBeInTheDocument();
    expect(screen.getByText(/Description:\s*Great gadget/)).toBeInTheDocument();

    // Image is rendered with alt equal to title
    const img = screen.getByRole("img", {
      name: /Test Product/i,
    }) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/img.jpg");

    // Rating and reviews
    expect(screen.getByText(/Rating:\s*4\.5\s*\/\s*5/)).toBeInTheDocument();
    expect(screen.getByText(/2 reviews/)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Loved it")).toBeInTheDocument();
  });

  it("renders nothing (no card) when there is no matching product for the id", () => {
    const otherProduct = {
      id: "2",
      title: "Other",
      category: "Misc",
      description: "Not the one",
      images: [],
      price: 1,
      rating: 3,
      reviews: [],
    };

    const store = makeStore({ products: [otherProduct] });

    render(
      <Provider store={store}>
        <ProductDetail />
      </Provider>
    );

    // No card should be rendered because filter by id won't match
    expect(screen.queryByTestId("card")).toBeNull();
  });
});
