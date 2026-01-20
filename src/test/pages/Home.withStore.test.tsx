import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import Home from "@/routes/pages/Home";

/* Mock Products and carousel UI to keep assertions simple */
vi.mock("@/components/Products", () => ({
  __esModule: true,
  default: ({ title, user }: any) => (
    <div data-testid="product">
      {title} - {user?.id}
    </div>
  ),
}));
vi.mock("@/components/ui/carousel", () => {
  return {
    __esModule: true,
    Carousel: ({ children }: any) => (
      <div data-testid="carousel">{children}</div>
    ),
    CarouselContent: ({ children }: any) => (
      <div data-testid="carousel-content">{children}</div>
    ),
    CarouselItem: ({ children }: any) => (
      <div data-testid="carousel-item">{children}</div>
    ),
    CarouselNext: (props: any) => (
      <button data-testid="carousel-next" {...props}>
        Next
      </button>
    ),
    CarouselPrevious: (props: any) => (
      <button data-testid="carousel-prev" {...props}>
        Prev
      </button>
    ),
  };
});
/* Mock auth hook */
vi.mock("@/routes/auth/AuthContext", () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: "user-123", name: "Test" } }),
}));

describe("Home with real store", () => {
  let mockProducts: any[] = [];

  beforeEach(() => {
    mockProducts = [
      {
        id: "p1",
        title: "Product 1",
        category: "c1",
        description: "d1",
        images: [],
        price: 10,
      },
      {
        id: "p2",
        title: "Product 2",
        category: "c2",
        description: "d2",
        images: [],
        price: 20,
      },
      {
        id: "p3",
        title: "Product 3",
        category: "c3",
        description: "d3",
        images: [],
        price: 30,
      },
      {
        id: "p4",
        title: "Product 4",
        category: "c4",
        description: "d4",
        images: [],
        price: 40,
      },
      {
        id: "p5",
        title: "Product 5",
        category: "c5",
        description: "d5",
        images: [],
        price: 50,
      },
      {
        id: "p6",
        title: "Product 6",
        category: "c6",
        description: "d6",
        images: [],
        price: 60,
      },
    ];
  });

  // Clean up after each test
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  function renderWithStore(productsState: any[]) {
    // simple reducer that just returns the provided state
    const productsReducer = (state = { products: productsState }) => state;

    const store = configureStore({
      reducer: {
        products: productsReducer,
      },
      // silence middleware warnings in tests
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    return render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
  }

  it("renders carousel container and prev/next controls", () => {
    renderWithStore(mockProducts);

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-next")).toBeInTheDocument();
  });

  it("renders up to 5 carousel items (slices products to first 5)", () => {
    renderWithStore(mockProducts);

    const items = screen.getAllByTestId("carousel-item");
    expect(items.length).toBe(5);
    expect(screen.getByText("Product 1 - user-123")).toBeInTheDocument();
    expect(screen.queryByText("Product 6 - user-123")).toBeNull();
  });
});
