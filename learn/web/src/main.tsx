import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";

// Self-hosted, exactly the weights the design system names.
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

import "katex/dist/katex.min.css";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/screens.css";
import "./styles/desk.css";
import "./styles/lists.css";
import "./styles/workspace.css";
import "./styles/topic.css";
import "./styles/sidebar.css";
import "./styles/focus.css";
import "./styles/jotter.css";
import "./styles/attempt.css";
import "./styles/grade.css";
import "./styles/wrapup.css";
import "./styles/debrief.css";
import "./styles/legacy.css";
import "./styles/dialogs.css";
import "./styles/tidy.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
