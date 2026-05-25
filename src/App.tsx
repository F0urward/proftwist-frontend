import { ThemeProvider } from "@mui/material/styles";
import { createThemeByMode } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactFlowProvider } from "@xyflow/react";
import { Provider } from "react-redux";
import { useAppSelector } from "./store";
import store from "./store";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const ThemedApp = () => {
  const mode = useAppSelector((state) => state.theme.mode);
  const theme = createThemeByMode(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ReactFlowProvider>
        <ThemedApp />
      </ReactFlowProvider>
    </Provider>
  );
};

export default App;
