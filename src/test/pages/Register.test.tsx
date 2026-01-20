import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
vi.mock("react-router", () => {
  return {
    __esModule: true,
    useNavigate: () => mockNavigate,
  };
});

/* mock firebase auth & the createUserWithEmailAndPassword function */
const mockCreateUserWithEmailAndPassword = vi.fn();
vi.mock("firebase/auth", () => ({
  __esModule: true,
  createUserWithEmailAndPassword: (...args: any[]) =>
    mockCreateUserWithEmailAndPassword(...args),
}));

/* mock your auth export (auth object) */
vi.mock("@/firebase", () => ({
  __esModule: true,
  auth: {}, // sentinel object; tests assert this is passed through
}));

vi.mock("@/components/auth/register-form", () => {
  return {
    __esModule: true,
    default: ({
      onSubmit,
      email,
      setEmail,
      password,
      setPassword,
    }: {
      onSubmit: (e: any) => void;
      email: string;
      setEmail: (v: string) => void;
      password: string;
      setPassword: (v: string) => void;
    }) => (
      <div>
        <input
          data-testid="email-input"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
        />
        <input
          data-testid="password-input"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <button
          data-testid="submit-button"
          onClick={() => {
            // simulate a real form submit event
            onSubmit({ preventDefault: () => {} });
          }}
        >
          Submit
        </button>
      </div>
    ),
  };
});

/* Now import the component under test (after mocks) */
import Register from "@/routes/pages/Register";

describe("Register page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // keep the mockNavigate reference (resetAllMocks resets its call history)
    mockNavigate.mockReset();
    mockCreateUserWithEmailAndPassword.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("calls createUserWithEmailAndPassword and navigates on success", async () => {
    // arrange: createUser resolves
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: "uid-123" },
    });

    render(<Register />);
    const user = userEvent.setup();

    const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
    const passwordInput = screen.getByTestId(
      "password-input"
    ) as HTMLInputElement;
    const submit = screen.getByTestId("submit-button");

    // act: type and submit
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submit);

    // assert: createUserWithEmailAndPassword called with auth, email, password
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123"
    );

    // wait for promise resolution and navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("logs error and does not navigate on failure", async () => {
    // arrange: createUser rejects with an error object
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: "auth/fail",
      message: "Bad request",
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<Register />);
    const user = userEvent.setup();

    const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
    const passwordInput = screen.getByTestId(
      "password-input"
    ) as HTMLInputElement;
    const submit = screen.getByTestId("submit-button");

    // act
    await user.type(emailInput, "fail@example.com");
    await user.type(passwordInput, "badpass");
    await user.click(submit);

    // assert createUser called
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "fail@example.com",
      "badpass"
    );

    // wait for the catch handler to run and assert console.log called with error pieces
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("auth/fail", "Bad request");
    });

    // ensure navigation did NOT happen
    expect(mockNavigate).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
