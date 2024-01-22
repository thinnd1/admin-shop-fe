import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar_admin from "../Dashboard/partials/Navbar_admin";
import '../../../style/admin.css';

const GetData = async function (link, SetProductAdd) {
  useEffect(() => {
    axios.get(link).then(response => {
      SetProductAdd(response.data);
    })
  }, [])
}

function ProductAdmin() {
  const [Categories, SetCategories] = useState([]);
  const [Brands, SetBrands] = useState([]);
  const [shopId, SetShopId] = useState('');
  const [productCategory, SetProductCategory] = useState('');
  const [expensesId, SetExpensesId] = useState('');
  const [brandId, SetBrandId] = useState('');

  const Categories_product = GetData('http://localhost:8000/api/shops', SetCategories);
  const Brands_product = GetData('http://localhost:8000/api/get-expense', SetBrands);

  async function HandleAddShopExpenses(e) {
    e.preventDefault();
    const link_api = 'http://localhost:8000/api/shop-expense';

    const formData = new FormData();
    formData.append('shop_id', shopId);
    formData.append('expenses_id', expensesId);

    try {
      await axios.post(link_api, formData).then(response => {
        console.log(response.data);
        if (response.data['status'] == 'ok') {
          window.location.href = '/admin/expenses/show';
        }
        if (response.data['status'] == 'error') {
          SetErrorMessage(response.data['message']);
        }
      })
    } catch (error) {
      // console.error(error);
    }
  }

  return (
    <>
      <Navbar_admin />

      <div style={{ position: 'relative', top: '4.3rem' }}>
        <div className="wrapper mx-auto max-w-md p-4">
          <div className="heading text-2xl font-bold mb-4">Add Expense</div>
          <div className="product">
            <form id="add-product-form" className="space-y-4" onSubmit={HandleAddShopExpenses}>

              <div className="__product__categories_brands">
                <label className="block" htmlFor="categories_selection">Shop Name</label>
                <div className="categories space-x-4">
                  <select className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
              dark:focus:border-blue-500" name="categories_selection" value={productCategory}
                    onChange={(e) => SetProductCategory(e.target.value)}>
                    {
                      Categories.map((categorie, key) => (
                        <option key={key} id={categorie.id} value={categorie.id} name={categorie.id}>{categorie.name}</option>
                      ))
                    }
                  </select>
                </div>
                <label className="block" htmlFor="brands_selection">Package</label>
                <div className="brands space-x-4">
                  <select className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
              dark:focus:border-blue-500" name="brands_selection" value={brandId} onChange={(e) => SetBrandId(e.target.value)}>
                    {
                      Brands.map((Brands, key) => (
                        <option key={key} id={Brands.id} value={Brands.id}>
                          {Brands.package}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="product__add">
                <input
                  type="submit"
                  value="Add expenses"
                  className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
export default ProductAdmin;
