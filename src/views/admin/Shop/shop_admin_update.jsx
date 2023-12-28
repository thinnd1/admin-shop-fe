import React from "react";
import { useState, useEffect } from "react";
import { json, useParams } from "react-router-dom";
import axios from "axios";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";


function ShopAdminUpdate() {
  const { id } = useParams();
  const [user, Setuser] = useState({});
  const [userInfos, SetUserInfos] = useState({ name: '', email: '' });
  const [isModified, SetIsModified] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/shop/${id}`)
      .then((response) => response.json())
      .then((data) => {
        Setuser(data);
        SetUserInfos({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,

        });
      })
      .catch((error) => console.error('Error Featching Data', error))
  }, []);

  const HandleInputChange = (e) => {
    const { name, value } = e.target;
    SetUserInfos({
      ...userInfos,
      [name]: value
    });
    // enable midfication status
    SetIsModified(true);
  }

  async function HandleUpdateShop(e) {
    e.preventDefault();
    await axios.put(`http://localhost:8000/api/shops/${id}`, userInfos)
      .then(response => {
        if (response.data['status'] == 'ok') {
          location.href = 'http://localhost:5000/admin/shop/show';
        }
      })
  }

  return (
    <>
      <Navbar_admin />

      <div style={{ position: 'relative', top: '4.3rem' }}>
        <div className="wrapper mx-auto max-w-md p-4">
          <div className="heading text-2xl font-bold mb-4">Update Shop</div>
          <div className="product">
            <form id="add-product-form" className="space-y-4" onSubmit={HandleUpdateShop}>

              <div className="product__desc space-y-4">
                <div className="user_name">
                  <label htmlFor="user_name" className="block">Shop Name</label>
                  <input
                    type="text"
                    id="user_name"
                    name="name"
                    placeholder="Enter Name"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={userInfos.name}
                    onChange={HandleInputChange}
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
                    value={userInfos.email}
                    onChange={HandleInputChange}
                  />
                </div>

                <div className="phone">
                  <label htmlFor="phone" className="block">Phone :</label>
                  <input
                    type="phone"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={userInfos.phone}
                    onChange={HandleInputChange}
                  />
                </div>

                <div className="address">
                  <label htmlFor="address" className="block">Address :</label>
                  <input
                    type="address"
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={userInfos.address}
                    onChange={HandleInputChange}
                  />
                </div>

                <div className="user__add">
                  <input
                    type="submit"
                    value="Update Shop"
                    className={isModified ? 'active-button' : 'disabled-button'}
                    disabled={!isModified}
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
export default ShopAdminUpdate;
