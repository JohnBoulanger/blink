import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "./style.css";

export default function Layout() {
  const { pathname } = useLocation();
  // the landing page lays out its own full-bleed sections
  const isLanding = pathname === "/";

  return (
    <div className="Layout">
      <Navbar variant="public" />
      <main className={isLanding ? "layout-main" : "layout-main container layout-contained"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
