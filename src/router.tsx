import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import { CreatorPage } from "./pages/CreatorPage";
import { ViewerPage } from "./pages/ViewerPage";
import RegisterPage from "./pages/RegisterPage";
import RoadmapsPage from "./pages/RoadmapsPage";
import RoadmapPage from "./pages/RoadmapPage";
import LoginPage from "./pages/LoginPage";
import PersonalRoadmapsPage from "./pages/PersonalRoadmapsPage";
import ChatsPage from "./pages/ChatsPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute/GuestOnlyRoute";
import AuthVKCallbackPage from "./pages/AuthVKCallback";

const RootLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          { path: "/roadmaps/:roadmap_id/edit", element: <CreatorPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/personal", element: <PersonalRoadmapsPage /> },
          { path: "/chats", element: <ChatsPage /> },
          { path: "/friends", element: <FriendsPage /> },
        ],
      },

      {
        element: <GuestOnlyRoute />,
        children: [
          { path: "/signup", element: <RegisterPage /> },
          { path: "/login", element: <LoginPage /> },
        ],
      },

      { path: "/", element: <RoadmapsPage /> },
      { path: "/view", element: <ViewerPage /> },
      { path: "/roadmaps", element: <RoadmapsPage /> },
      { path: "/roadmaps/:id", element: <RoadmapPage /> },
      { path: "/auth/vk/callback", element: <AuthVKCallbackPage /> },

      { path: "*", element: <Navigate to="/roadmaps" replace /> },
    ],
  },
]);
