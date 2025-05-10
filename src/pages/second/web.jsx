import React from 'react';
import { hydrateRoot } from "react-dom/client";
import { loadableReady } from "@loadable/component";

import Page from "./page";
loadableReady(() => {
  const root = document.getElementById("root");
  hydrateRoot(root, <Page />);
});
