import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";
import DelteConfirmatonPop from "../component/pop/delete_confirmation";
import UserAdminDelete from "./user_admin_delete";

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
  const usersList = userData('http://localhost:8000/api/admin/user/show', SetUserList);
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

  async function HandleUpdateUserAdmin(UserID) {
    location.href = `http://localhost:5000/admin/user/update/${UserID}`;
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
          <h1 className="text-2xl font-bold mb-4">Client User List</h1>
          <Link className='border_btn text-s text-white font-semi-bold rounded p-2 flex items-center' style={{ backgroundColor: '#5969ed' }} to="http://localhost:5000/admin/user/add">Add new user account</Link>
        </div>
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead>
            <tr className='bg-sky-600'>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                user email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                email verification
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
            {UserList.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email_verified_at == null ?
                  <p className="font-bold">false</p> : <p className="font-bold">'true'</p>}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link className="border_btn rounded flex items-center justify-center p-2"
                    style={{ backgroundColor: '#ffa5008a' }} onClick={() => HandleUpdateUserAdmin(user.id)}>update</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="border_btn rounded flex items-center justify-center p-2"
                    style={{ backgroundColor: '#ff000096' }} onClick={() => HandleDeleteClick(user.id)}>delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
export default UserAdminShow;
