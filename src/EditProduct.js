import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_API_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${apiUrl}/api/admin/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`获取产品失败: ${response.status}`);
        }
        const data = await response.json();
        setProduct({
          name: data.name,
          description: data.description,
          price: data.price
        });
      } catch (error) {
        console.error('获取产品时出错:', error);
        toast.error('获取产品失败');
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      name: product.name,
      description: product.description,
      price: parseFloat(product.price)
    };

    const adminToken = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${apiUrl}/api/admin/editproduct/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        toast.success('产品更新成功');
        navigate('/admin/product-management');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || '更新产品失败');
        toast.error(errorData.error || '更新产品失败');
      }
    } catch (error) {
      setErrorMessage("更新产品时出错");
      console.error('更新产品时出错:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">编辑产品</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">产品名称</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">价格</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            step="0.01"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded-md">
          更新产品
        </button>
      </form>
    </div>
  );
};

export default EditProduct;