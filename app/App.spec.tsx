import { expect } from "vitest";

import App from './App'

export default {
  title: 'App',
  component: App
}

export const RenderHelloWorld = () => <App />;

RenderHelloWorld.play = async () => {
  //
};

RenderHelloWorld.test = async (browser: any) => {  
  expect(browser.element.findByText("Hello, World!").text).to.equal('Hello, World!');
};
