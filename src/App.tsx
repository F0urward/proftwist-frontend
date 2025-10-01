import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreatorPage from "./pages/CreatorPage.tsx";
import ViewerPage from "./pages/ViewerPage.tsx";

function App() {
  return (
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
  );
}

export default App;
