import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProductsPage from "@/routes/pages/ProductsPage";

/* Mock Products to render a simple node with title and user id for assertions */
vi.mock("@/components/Products", () => {
  return {
    __esModule: true,
    default: ({ title, user }: any) => (
      <div data-testid="product">
        {title}
        {" - "}
        {user?.id ?? "no-user"}
      </div>
    ),
  };
});

/* Mock the auth hook used by the component (path used in the component: "../auth/AuthContext") */
vi.mock("@/routes/auth/AuthContext", () => {
  return {
    __esModule: true,
    useAuth: () => ({ user: { id: "user-xyz", name: "Tester" } }),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeStore(
  preloadedProductsState: any,
  preloadedCartState: any = { cartProducts: [], totalAmount: 0 }
) {
  // simple reducer that returns the slice stored in preloaded state
  const productsReducer = (state = preloadedProductsState) => state;
  const cartReducer = (state = preloadedCartState) => state;

  return configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
    },
    preloadedState: {
      products: preloadedProductsState,
      cart: preloadedCartState,
    },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

describe("ProductsPage", () => {
  it("renders Products for each product in the store", () => {
    const products = [
      {
        id: "p1",
        title: "P1",
        category: "c",
        description: "",
        images: [],
        price: 1,
      },
      {
        id: "p2",
        title: "P2",
        category: "c",
        description: "",
        images: [],
        price: 2,
      },
      {
        id: "p3",
        title: "P3",
        category: "c",
        description: "",
        images: [],
        price: 3,
      },
    ];
    // include a minimal cart state so selectors won't throw
    const cartState = { cartProducts: [], totalAmount: 0 };
    const store = makeStore(
      { products, hasMore: false, loading: false },
      cartState
    );

    render(
      <Provider store={store}>
        <ProductsPage />
      </Provider>
    );

    const productNodes = screen.getAllByTestId("product");
    expect(productNodes).toHaveLength(3);

    // assert first product text includes user id from mocked auth
    expect(productNodes[0]).toHaveTextContent(/P1\s*-\s*user-xyz/);
  });

  it('shows "Loading more products..." when loading is true and products exist', () => {
    const products = [
      {
        id: "p1",
        title: "P1",
        category: "c",
        description: "",
        images: [],
        price: 1,
      },
    ];
    const store = makeStore({ products, hasMore: true, loading: true });

    render(
      <Provider store={store}>
        <ProductsPage />
      </Provider>
    );

    expect(
      screen.getByText(/Loading more products\.\.\./i)
    ).toBeInTheDocument();
  });

  it('shows "Load More" button when hasMore is true and not loading', () => {
    const products = [
      {
        id: "p1",
        title: "P1",
        category: "c",
        description: "",
        images: [],
        price: 1,
      },
    ];
    const store = makeStore({ products, hasMore: true, loading: false });

    render(
      <Provider store={store}>
        <ProductsPage />
      </Provider>
    );

    // Use role/text query to find the button
    const button = screen.getByRole("button", { name: /load more/i });
    expect(button).toBeInTheDocument();
  });

  it("shows 'You've seen all products!' when hasMore is false and not loading", () => {
    const products = [
      {
        id: "p1",
        title: "P1",
        category: "c",
        description: "",
        images: [],
        price: 1,
      },
    ];
    const store = makeStore({ products, hasMore: false, loading: false });

    render(
      <Provider store={store}>
        <ProductsPage />
      </Provider>
    );

    expect(screen.getByText(/You've seen all products!/i)).toBeInTheDocument();
  });

  it("renders no product nodes when products list is empty", () => {
    const store = makeStore({ products: [], hasMore: false, loading: false });

    render(
      <Provider store={store}>
        <ProductsPage />
      </Provider>
    );

    expect(screen.queryAllByTestId("product")).toHaveLength(0);
    expect(screen.queryAllByTestId("carousel-item")).toHaveLength(0); // defensive: if a carousel is used elsewhere
  });
});
