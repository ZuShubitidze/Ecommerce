import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";

// If you need providers (Router, Redux, Context), add them here.
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render
export { customRender as render };
