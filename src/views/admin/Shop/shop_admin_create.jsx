import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";

function ShopAdminCreate() {
  const [name, SetName] = useState("");
  const [email, SetEmail] = useState("");
  const [phone, SetPhone] = useState("");
  const [address, SetAddress] = useState("");
  const [SuccessMessage, SetSuccessMessage] = useState("");
  const [ErrorMessage, SetErrorMessage] = useState("");


  async function HandleAddUser(e) {
    e.preventDefault();
    const FormData = {
      'name': name,
      'email': email,
      'phone': phone,
      'address': address
    }
    try {
      await axios.post('http://localhost:8000/api/shops', FormData).then(response => {
        console.log(response.data);
        if (response.data['status'] == 'ok') {
          SetSuccessMessage(response.data['message']);
          window.location.href = '/admin/shop/show';
        }
        if (response.data['status'] == 'error') {
          SetErrorMessage(response.data['message']);
        }
      })
    } catch (error) {
      // return errors
    }
  }
  return (
    <>
      <Navbar_admin />

      <div style={{ position: 'relative', top: '4.3rem' }}>
        <div>
          {SuccessMessage && <div className="success-message">{SuccessMessage}</div>}
          {ErrorMessage && <div className="error-message">{ErrorMessage}</div>}
        </div>
        <div className="wrapper mx-auto max-w-md p-4">
          <div className="heading text-2xl font-bold mb-4">Add Shop</div>
          <div className="product">
            <form id="add-product-form" className="space-y-4" onSubmit={HandleAddUser}>

              <div className="product__desc space-y-4">
                <div className="user_name">
                  <label htmlFor="user_name" className="block">Shop Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter Company Name"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => SetName(e.target.value)}
                  />
                </div>
                <div className="user_email">
                  <label htmlFor="user_email" className="block">Email address:</label>
                  <input
                    type="email"
                    id="user_email"
                    name="email"
                    placeholder="Enter Email"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => SetEmail(e.target.value)}
                  />
                </div>
                <div className="phone">
                  <label htmlFor="phone" className="block">Phone:</label>
                  <input
                    type="phone"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => SetPhone(e.target.value)}
                  />
                </div>
                <div className="address">
                  <label htmlFor="address" className="block">Address:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => SetAddress(e.target.value)}
                  />
                </div>


                <div className="user__add">
                  <input
                    type="submit"
                    value="Add Shop"
                    className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
export default ShopAdminCreate;
