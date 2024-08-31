import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminiLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });
      const data = await response.json();
      if (data.token) {
        setIsAdminLoggedIn(true)
         // 获取当前时间戳并存储到 localStorage
        const loginTimeStamp = new Date().getTime();
        localStorage.setItem('adminloginTimeStamp', loginTimeStamp);
        
        // 保存 token，可以考虑使用 local storage 或其他方式保存以便后续请求使用
        localStorage.setItem('adminToken', data.token);
        // 保存登录状态到 localStorage
        localStorage.setItem('isAdminiLoggedIn', true);
        checkAdminStatus();
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred during login.');
    }
  };


  const checkAdminStatus = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://127.0.0.1:3000/admininfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const userData = await response.json();
      if (userData.permissions && userData.permissions.admin_flag) {
        // 确认是管理员后正式设置登录状态并导航
        setIsAdminLoggedIn(true);
        navigate('/admin/management');
      } else {
        // 不是管理员，清除登录状态
        setIsAdminLoggedIn(false);
        localStorage.clear();
        setErrorMessage('You do not have admin privileges.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while checking admin status.');
    }
  };

  if (!isAdminiLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Admin Login</h1>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          className="border p-2 rounded mb-2 w-64"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className="border p-2 rounded mb-4 w-64"
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded w-64">
          Login
        </button>
      </div>
    );
  }  else {
    return null
  }
};

export default AdminPage;