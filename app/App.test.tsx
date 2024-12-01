import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {

    let unMount: () => void = () => { };

    beforeEach(() => {
        const { unmount } = render(<App />);

        unMount = unmount;
    });

  it("renders hello world text", () => {
    expect(screen.getByTestId("test").textContent).toBe('Hello, World!');
  });

    afterEach(() => {
        unMount();
    });

});