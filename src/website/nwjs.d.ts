// NW.js recognizes a non-standard `nwsaveas` attribute on
// `<input type="file">` to open a native save-file dialog; the chosen
// path is then reported via the input's `value`. See docs.nwjs.io on
// file dialogs.
import "react";

declare module "react" {
  interface InputHTMLAttributes<T> {
    nwsaveas?: string;
  }
}
