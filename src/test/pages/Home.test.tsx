import Home from "@/routes/pages/Home";
import { render, screen, cleanup, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * Important: declare mocks state variables BEFORE calling vi.mock so the factories
 * close over re-assignable variables.
 */
let mockProducts: any[] = [];
let mockUser: any = { id: "user-123", name: "Test User" };

/* Mock Products component (keeps a readable DOM to assert against) */
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

/* Mock carousel primitives used by Home (use stable data-testids) */
vi.mock("@/components/ui/carousel", () => {
  return {
    __esModule: true,
    Carousel: ({ children, ...props }: any) => (
      <div data-testid="carousel" {...props}>
        {children}
      </div>
    ),
    CarouselContent: ({ children, ...props }: any) => (
      <div data-testid="carousel-content" {...props}>
        {children}
      </div>
    ),
    CarouselItem: ({ children, ...props }: any) => (
      <div data-testid="carousel-item" {...props}>
        {children}
      </div>
    ),
    /* match your component's rendered data-testid names (snapshot showed carousel-previous / carousel-next) */
    CarouselNext: (props: any) => (
      <button data-testid="carousel-next" {...props}>
        Next
      </button>
    ),
    CarouselPrevious: (props: any) => (
      <button data-testid="carousel-previous" {...props}>
        Previous
      </button>
    ),
  };
});

/* Mock the auth hook; return the current mockUser */
vi.mock("@/routes/auth/AuthContext", () => {
  return {
    __esModule: true,
    useAuth: () => ({ user: mockUser }),
  };
});

/* Mock react-redux useSelector; ensure __esModule: true so named import works */
vi.mock("react-redux", () => {
  return {
    __esModule: true,
    useSelector: (selector: any) =>
      selector({ products: { products: mockProducts } }),
    useDispatch: () => vi.fn(),
  };
});

describe("Home page (mocked dependencies)", () => {
  beforeEach(() => {
    // Default Mock Data
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
    mockUser = { id: "user-123", name: "Test User" };
  });
  // Clean up after each test
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the carousel container and prev/next controls", () => {
    render(<Home />);

    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-previous")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-next")).toBeInTheDocument();
  });

  it("renders up to 5 carousel items (slices products to first 5) and passes user", () => {
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
    mockUser = { id: "user-123", name: "Test User" };

    // sanity-check the variable before render (optional but useful)
    expect(mockUser.id).toBe("user-123");

    // With 6 mock products, Home should slice to first 5
    render(<Home />);

    const items = screen.getAllByTestId("carousel-item");
    expect(items.length).toBe(5);

    // use a regex to tolerate whitespace/newline splitting in the DOM
    const firstProductNode = within(items[0]).getByTestId("product");
    expect(firstProductNode).toHaveTextContent(/Product 1\s*-\s*user-123/);

    // ensure product 6 is not rendered
    expect(screen.queryByText(/Product 6/)).toBeNull();
  });

  it("passes updated user to Products when mockUser is changed", () => {
    mockProducts = [
      {
        id: "only",
        title: "Solo",
        category: "c",
        description: "d",
        images: [],
        price: 1,
      },
    ];
    mockUser = { id: "special-user", name: "Special" };

    render(<Home />);

    // Product mock renders "title - userId"
    expect(screen.getByTestId("product")).toHaveTextContent(
      /Solo\s*-\s*special-user/
    );
  });

  it("renders no product items if products array is empty", () => {
    mockProducts = [];
    render(<Home />);

    expect(screen.queryByTestId("product")).toBeNull();
    expect(screen.queryByTestId("carousel-item")).toBeNull();
  });
});
