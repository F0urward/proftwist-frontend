import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreatorPage from "./pages/CreatorPage.tsx";
import ViewerPage from "./pages/ViewerPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import RoadmapsPage from "./pages/RoadmapsPage.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.ts";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar/Navbar.tsx";

function App() {
  const isAuth = false;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Navbar isAuth={isAuth} />
          <Routes>
            <Route path="/" element={<CreatorPage />} />
            <Route path="/view" element={<ViewerPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/roadmaps" element={<RoadmapsPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
