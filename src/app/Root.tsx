import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar";

export function Root() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Public Sans', sans-serif", backgroundColor: "#F8F7FA" }}>
      <Navbar />
      <Outlet />
    </div>
  );
}