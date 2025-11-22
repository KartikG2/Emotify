import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OTPVerify from "./components/OtpVerify";
import Dashboard from "./components/Dashboards";
import FaceScan from "./components/FaceScan";
import MusicPlayer from "./components/MusicPlayer";
import { AuthProvider } from "./context/AuthProvider";
import Protected from "./components/Protected";
import Callback from "./components/Callback";
import About from "./components/About";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
           <Route path="/about" element={<About/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OTPVerify />} />

          {/* Protected routes */}
          <Route
            path="/Dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
           <Route
            path="/callback"
            element={
              <Protected>
                <Callback />
              </Protected>
            }
          />

          <Route
            path="/FaceScan"
            element={
              <Protected>
                <FaceScan />
              </Protected>
            }
          />
          <Route
            path="/MusicPlayer"
            element={
              <Protected>
                <MusicPlayer/>
              </Protected>
            }
          />
        </Routes>
      </AuthProvider>
      <Footer />
    </BrowserRouter>
  );
}
