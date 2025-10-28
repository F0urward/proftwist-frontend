import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.ts";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactFlowProvider } from "@xyflow/react";
import { Provider } from "react-redux";
import store from "./store";

import Navbar from "./components/Navbar/Navbar.tsx";

import { CreatorPage } from "./pages/CreatorPage.tsx";
import { ViewerPage } from "./pages/ViewerPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import RoadmapsPage from "./pages/RoadmapsPage.tsx";
import RoadmapPage from "./pages/RoadmapPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import MaterialsPage from "./pages/MaterialsPage.tsx";
import PersonalRoadmapsPage from "./pages/PersonalRoadmapsPage.tsx";
import ChatsPage from "./pages/ChatsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";
import GuestOnlyRoute from "./components/GuestOnlyRoute/GuestOnlyRoute.tsx";

const App = () => {
  return (
    <Provider store={store}>
      <ReactFlowProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div>
              <Navbar />
              <Routes>
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<CreatorPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/personal" element={<PersonalRoadmapsPage />} />
                  <Route path="/chats" element={<ChatsPage />} />
                </Route>
                <Route element={<GuestOnlyRoute />}>
                  <Route path="/signup" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/view" element={<ViewerPage />} />
                <Route path="/roadmaps" element={<RoadmapsPage />} />
                <Route path="/roadmaps/:id" element={<RoadmapPage />} />
                <Route path="/materials" element={<MaterialsPage />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </ReactFlowProvider>
    </Provider>
  );
};

export default App;
