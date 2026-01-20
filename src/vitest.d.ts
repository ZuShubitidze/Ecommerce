import { RenderResult, screen } from "@testing-library/react";

declare global {
  // eslint-disable-next-line no-var
  var render: (ui: React.ReactElement, options?: any) => RenderResult;
  // eslint-disable-next-line no-var
  var screen: typeof screen;
}
