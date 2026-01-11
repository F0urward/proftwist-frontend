import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactFlowProvider } from "@xyflow/react";
import { Provider } from "react-redux";
import store from "./store";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const App = () => {
  return (
    <Provider store={store}>
      <ReactFlowProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </ReactFlowProvider>
    </Provider>
  );
};

export default App;
