// src/vitest.d.ts
import { render, screen } from "@testing-library/react";

declare global {
  const render: typeof render;
  const screen: typeof screen;
}
