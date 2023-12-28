import React from "react";


function SideBarProfile(){
   return(
    <>
    <div className="mt-6 bg-white shadow rounded p-4 divide-y divide-gray-200 space-y-4 text-gray-600">
          <div className="space-y-1 pl-8">
            <a href="/profile/ProfileInformation"
              className="relative hover:text-primary block capitalize transition"
            >
              Profile information
            </a>
            <a href="/profile/ManageAddress"
              className="relative hover:text-primary block capitalize transition"
            >
              Manage addresses
            </a>
            <a href="/profile/Change_password"
              className="relative hover:text-primary block capitalize transition"
            >
              Change password
            </a>
          </div>
          <div className="space-y-1 pl-8 pt-4">
            <a href="/profile/OrderHistory"
              className="relative hover:text-primary block font-medium capitalize transition"
            >
              <span className="absolute -left-8 top-0 text-base">
                <i className="fa-solid fa-box-archive" />
              </span>
              My order history
            </a>
            <a href="#"
              className="relative hover:text-primary block capitalize transition"
            >
              My returns
            </a>
            <a href="#"
              className="relative hover:text-primary block capitalize transition"
            >
              My Cancellations
            </a>
            <a href="#"
              className="relative hover:text-primary block capitalize transition"
            >
              My reviews
            </a>
          </div>
          <div className="space-y-1 pl-8 pt-4">
            <a
              href="#"
              className="relative hover:text-primary block font-medium capitalize transition"
            >
              <span className="absolute -left-8 top-0 text-base">
                <i className="fa-regular fa-credit-card" />
              </span>
              Payment methods
            </a>
            <a
              href="#"
              className="relative hover:text-primary block capitalize transition"
            >
              voucher
            </a>
          </div>
          <div className="space-y-1 pl-8 pt-4">
            <a
              href="/wishlist"
              className="relative hover:text-primary block font-medium capitalize transition"
            >
              <span className="absolute -left-8 top-0 text-base">
                <i className="fa-regular fa-heart" />
              </span>
              My wishlist
            </a>
          </div>
          <div className="space-y-1 pl-8 pt-4">
            <a
              href="#"
              className="relative hover:text-primary block font-medium capitalize transition"
            >
              <span className="absolute -left-8 top-0 text-base">
                <i className="fa-regular fa-arrow-right-from-bracket" />
              </span>
              Logout
            </a>
          </div>
        </div>
    </>
   )
}
export default SideBarProfile;
