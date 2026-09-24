import { useState } from "react";

import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";

import "./AppLayout.css";

const AppLayout = () => {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="app-layout-main-content">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="app-layout-sub-content">
        <Header  key={location.pathname} onMenuClick={() => setSidebarOpen(true)} />

        <div className="app-layout-scroll-content">
          <Breadcrumb />

          <div className="app-layout-page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
