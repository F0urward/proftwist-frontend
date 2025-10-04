import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CreatorPage } from "./pages/CreatorPage.tsx";
import { ViewerPage } from "./pages/ViewerPage.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.ts";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactFlowProvider } from "@xyflow/react";

function App() {
  return (
    <ReactFlowProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div>
            <nav>
              <Link to="/">Creator</Link> | <Link to="/view">Viewer</Link>
            </nav>
            <Routes>
              <Route path="/" element={<CreatorPage />} />
              <Route path="/view" element={<ViewerPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ReactFlowProvider>
  );
}

export default App;
