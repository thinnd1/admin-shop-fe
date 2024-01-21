import React, { useEffect } from 'react';
import Navbar_admin from "./Dashboard/partials/Navbar_admin";
import Sidebar_admin from "./Dashboard/partials/Sidebar_admin";
import Dashboard_admin from "./Dashboard/Dashboard_admin";
import Footer_admin from "./Dashboard/partials/Footer_admin";
import '../../javascript/Sidebar';

const Admin = function () {
  useEffect(() => {
    // Check if the variable exists in local storage
    const admin_id = localStorage.getItem('admin_id');
    console.log(11246);
    if (!admin_id) {
      // The variable exists in local storage
      window.location.replace('/admin/login');
    }
  }, []);

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-800">
        <Navbar_admin />
        <div className="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Sidebar_admin />
          <div id="main-content" className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900">
            <main>
              <Dashboard_admin />
            </main>
            <Footer_admin />
          </div>
        </div>
      </div>
    </>
  )
}
export default Admin;
