import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RootProviders from "@/app/_layout";
import NotFoundScreen from "@/app/+not-found";
import AdminLoginScreen from "@/app/admin-login";
import AdminScreen from "@/app/admin";
import HomeScreen from "@/app/index";
import MessageScreen from "@/app/message";

export default function App() {
  return (
    <BrowserRouter>
      <RootProviders>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/admin-login" element={<AdminLoginScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/message" element={<MessageScreen />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </RootProviders>
    </BrowserRouter>
  );
}
