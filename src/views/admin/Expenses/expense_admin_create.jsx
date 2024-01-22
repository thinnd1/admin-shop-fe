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
  const [productAdd, SetProductAdd] = useState([]);
  {/* Admin Product creat States */ }
  const [productImage, SetProductImage] = useState(null);
  const [productName, SetProductName] = useState('');
  const [productPrice, SetProductPrice] = useState('');
  const [productQte, SetProductQte] = useState('');
  const [productCategory, SetProductCategory] = useState('');
  const [shopId, SetShopId] = useState('');
  const [descriptionProduct, SetdescriptionProduct] = useState('');
  const [brandId, SetBrandId] = useState('');

  {/** Handle product image **/ }
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log('========== ', file);
    SetProductImage(file);
  };
  {/** extract Categories product api **/ }
  const Categories_product = GetData('http://localhost:8000/api/shops', SetCategories);
  const Brands_product = GetData('http://localhost:8000/api/product/brands/show', SetBrands);
  const GetShop = GetData('http://localhost:8000/api/shops', SetShopId);


  async function HandleAddProduct(e) {
    e.preventDefault();
    const link_api = 'http://localhost:8000/api/admin/product/create';

    const formData = new FormData();
    formData.append('product_image', productImage); // productImage là đối tượng file được chọn từ input[type="file"]
    formData.append('Product_image_size', productImage.size);
    formData.append('Product_image_format', productImage.type);
    formData.append('name', productName);
    formData.append('price_unit', productPrice);
    formData.append('product_quantity', productQte);
    formData.append('product_category', productCategory);
    formData.append('shop_id', shopId);
    formData.append('brand_id', brandId);
    formData.append('product_description', descriptionProduct);
    try {
      await axios.post(link_api, formData).then(response => {
        console.log(response.data);
        if (response.data['status'] == 'ok') {
          window.location.href = '/shop/product/show';
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
            <form id="add-product-form" className="space-y-4" onSubmit={HandleAddProduct}>

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
                <label className="block" htmlFor="brands_selection">Brand</label>
                <div className="brands space-x-4">
                  <select className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
              dark:focus:border-blue-500" name="brands_selection" value={brandId} onChange={(e) => SetBrandId(e.target.value)}>
                    {
                      Brands.map((Brands, key) => (
                        <option key={key} id={Brands.id} name={Brands.name} value={Brands.id}>
                          {Brands.brand_name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
export default ProductAdmin;
