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
function UserAdminShow() {
  const [UserList, SetUserList] = useState([]);
  const [DelteConfirmatonPopVisible, SetDelteConfirmatonPopVisible] = useState(false);
  const usersList = userData('http://localhost:8000/api/order', SetUserList);
  const [userId, SetuserId] = useState([]);

  const HandleDeleteClick = (useridData) => {
    SetDelteConfirmatonPopVisible(true);
    SetuserId(useridData);
  }

  const HandleCancelSub = () => {
    SetDelteConfirmatonPopVisible(false);
  }

  const HandleConfirmSub = () => {
    if (userData !== null || userData.length > 0) {
      location.href = `http://localhost:5000/admin/user/delete/${userId}`;
    }
    else {
      location.href = `http://localhost:5000/admin/user/show?error=Invalid_id`;
    }
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
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead>
            <tr className='bg-sky-600'>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Shipping option
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Confirmed
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {UserList.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.shipping_option == 1 ? (
                    <div>Fast</div>
                  ) : user.shipping_option == 2 ? (
                    <div>Normal</div>
                  ) : (
                    <div>Dafault</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status == null ?
                  <p className="font-bold">false</p> : <p className="font-bold">
                    {user.status == 1 ? (
                      <div>Process</div>
                    ) : user.status == 2 ? (
                      <div>Shipping</div>
                    ) : (
                      <div>Done</div>
                    )}
                  </p>}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.sub_total}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.is_confirmed}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
export default UserAdminShow;
