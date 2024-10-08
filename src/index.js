import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './styles.css'; // 确保这里是正确引入 Tailwind CSS 的样式文件路径
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';



import App from './App';

import ProductDetail from './ProductDetail';
import reportWebVitals from './reportWebVitals';

import UserInfo from './UserInfo';
import AdminPage from './AdminPage'; // 管理员页面组件
import AdminProductManagement from './AdminProductManagement'; // 假设这是产品管理页面组件
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import AddProduct from './AddProduct'; // 导入添加产品页面组件
import EditProduct from './EditProduct';
import CheckOut from './CheckOut';
import OrderManagement from './OrderManagement';

import { AuthProvider } from './AuthContext'; // 导入 AuthProvider
import Orders from './Order';
import Warrants from './Warrants';
import RedeemManagement from './RedeemManagement';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

     <Router>
     <AuthProvider>
      <div>
        <Routes>
          <Route exact path="/*" element={<App />} />

          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/userinfo" element={<UserInfo />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/admin-x-page" element={<AdminPage />} />
          <Route path="/admin/management" element={<AdminProductManagement />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/product-management" element={<ProductManagement />} />
          <Route path="/admin/order-management" element={<OrderManagement />} />
          <Route path="/admin/redeem-management" element={<RedeemManagement />} />
          <Route path="/admin/add-product" element={<AddProduct />} /> // 添加产品路由
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/warrants" element={<Warrants />} />
        </Routes>
      </div>

      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
