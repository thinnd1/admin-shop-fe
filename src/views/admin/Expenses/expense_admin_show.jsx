import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";
import DelteConfirmatonPop from "../component/pop/delete_confirmation";

const userData = async function (link, SetData) {
  useEffect(() => {
    axios.get(link).then(response => {
      SetData(response.data);
    })
  }, [])
}
function ShopAdminShow() {
  const [ShopList, SetShopList] = useState([]);
  const [DelteConfirmatonPopVisible, SetDelteConfirmatonPopVisible] = useState(false);
  const shopsList = userData('http://localhost:8000/api/get-shop-expense', SetShopList);
  const [shopId, SetshopId] = useState([]);

  const HandleDeleteClick = (shopidData) => {
    SetDelteConfirmatonPopVisible(true);
    SetshopId(shopidData);
  }

  const HandleCancelSub = () => {
    SetDelteConfirmatonPopVisible(false);
  }

  const HandleConfirmSub = () => {
    if (userData !== null || userData.length > 0) {
      location.href = `http://localhost:5000/admin/shop/delete/${shopId}`;
    }
    else {
      location.href = `http://localhost:5000/admin/shop/show?error=Invalid_id`;
    }
  }

  async function HandleUpdateShopAdmin(ShopID) {
    location.href = `http://localhost:5000/admin/shop/update/${ShopID}`;
  }
  return (
    <>
      <Navbar_admin />

      <div style={{ position: 'relative', top: '4.3rem' }}>
        {
          DelteConfirmatonPopVisible && (<DelteConfirmatonPop
            onCancel={HandleCancelSub}
            onConfirm={HandleConfirmSub} />)
        }
        <div className='flex justify-between p-4'>
          <h1 className="text-2xl font-bold mb-4">Shop List</h1>
          <Link className='border_btn text-s text-white font-semi-bold rounded p-2 flex items-center' style={{ backgroundColor: '#5969ed' }} to="http://localhost:5000/admin/shop/add">Add new shop</Link>
        </div>
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead>
            <tr className='bg-sky-600'>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Name Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Expenses Pakage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Created at
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                End date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                delete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ShopList.map((shop, index) => (
              <tr key={shop.id}>
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shop.shop_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shop.expenses_pakage}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shop.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap">{shop.created_at}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <Link className="border_btn rounded flex items-center justify-center p-2"
                    style={{ backgroundColor: '#ffa5008a' }} onClick={() => HandleUpdateShopAdmin(shop.id)}>Update</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="border_btn rounded flex items-center justify-center p-2"
                    style={{ backgroundColor: '#ff000096' }} onClick={() => HandleDeleteClick(shop.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
export default ShopAdminShow;
