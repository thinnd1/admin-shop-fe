import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";

const userData = async function (link, SetData) {
  useEffect(() => {
    axios.get(link).then(response => {
      SetData(response.data);
    })
  }, [])
}
function UserAdminShow() {

  return (
    <>
      <Navbar_admin />
      <div style={{
        position: 'relative',
        top: '4.3rem'
      }}>
        <div className="wrapper mx-auto max-w-md p-4">
          <div className="heading text-2xl font-bold mb-4">Update Information Admin</div>
          <form id="add-product-form" className="space-y-4">
            <div className="product__quantity">
              <label htmlFor="product_price" className="block">Email</label>
              <input
                type="text"
                id="Category_name"
                name="cat_name"
                placeholder="Enter Email"
                className="w-full border border-gray-300 rounded px-2 py-1"
                onChange={(e) => SetNameCategory(e.target.value)}
              />
            </div>

            <div className="product__quantity">
              <label htmlFor="product_price" className="block">Phone Number</label>
              <input
                type="text"
                id="Category_name"
                name="cat_name"
                placeholder="Enter Phone Number"
                className="w-full border border-gray-300 rounded px-2 py-1"
                onChange={(e) => SetNameCategory(e.target.value)}
              />
            </div>

            <div className="product__Category_description">
              <label htmlFor="product_Category_description" className="block">Address</label>
              <textarea
                id="product_Category_description"
                name="product_Category_description"
                cols={30}
                rows={5}
                placeholder="Enter Address"
                className="w-full border border-gray-300 rounded px-2 py-1"
                onChange={(e) => SetdescriptionCategory(e.target.value)}
              />
            </div>

            <div className="product__quantity">
              <label htmlFor="product_price" className="block">Password</label>
              <input
                type="text"
                id="Category_name"
                name="cat_name"
                placeholder="Enter Password"
                className="w-full border border-gray-300 rounded px-2 py-1"
                onChange={(e) => SetNameCategory(e.target.value)}
              />
            </div>

            <div className="product__add">
              <input
                type="submit"
                value="Update"
                className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
export default UserAdminShow;
