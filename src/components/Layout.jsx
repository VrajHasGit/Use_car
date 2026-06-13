import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [isSlim, setIsSlim] = useState(false);

  const toggleSidebar = () => setIsSlim(!isSlim);

  return (
    <>
      <Sidebar isSlim={isSlim} />
      <Topbar isSlim={isSlim} toggleSidebar={toggleSidebar} />
      <div id="main" className={isSlim ? 'slim' : ''}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
