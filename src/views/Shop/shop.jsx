import React, { useEffect } from 'react';
import Navbar_admin from "./Dashboard/partials/Navbar_shop";
import Sidebar_admin from "./Dashboard/partials/Sidebar_shop";
import Dashboard_admin from "./Dashboard/Dashboard_shop";
import Footer_admin from "./Dashboard/partials/Footer_shop";
import '../../javascript/Sidebar';

const Admin = function () {
  useEffect(() => {
    // Check if the variable exists in local storage
    const shop_id = localStorage.getItem('shop_id');

    if (!shop_id) {
      // The variable exists in local storage
      window.location.replace('/shop/login');
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
