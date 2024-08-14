import { screen} from '@testing-library/react'
import { expect } from "vitest";

import App from './App'

export default {
  title: 'App',
  component: App
}

export const RenderHelloWorld = () => <App />;

RenderHelloWorld.test = async (browser: any) => {
    expect(screen.getByTestId("test").textContent).toBe('Hello, World!');
};