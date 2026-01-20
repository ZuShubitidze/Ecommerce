import Login from "@/routes/pages/Login";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("@/components/auth/login-form", () => {
  return {
    __esModule: true,
    LoginForm: () => <div data-testid="login-form">Mock LoginForm</div>,
  };
});

describe("Login page", () => {
  it("renders the LoginForm inside the centered page container", () => {
    render(<Login />);

    const form = screen.getByTestId("login-form");
    expect(form).toBeInTheDocument();
    expect(form.parentElement).toHaveClass("w-full", "max-w-sm");
    expect(form.parentElement?.parentElement).toHaveClass(
      "flex",
      "items-center",
      "justify-center"
    );
  });
});
