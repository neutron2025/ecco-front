import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminProductManagement = () => {
  const navigate = useNavigate();
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLogoutClicked(true);
    toast.info('Logged out successfully!');
    localStorage.clear();
    navigate('/admin-x-page');
  };

  
    useEffect(() => {
        // 检查登录状态
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken) {
          navigate('/admin-x-page'); // 如果没有 token，重定向到登录页面
        }
    
        // 检查 Token 是否过期
        const loginTimeStamp = localStorage.getItem('adminloginTimeStamp');
        if (storedToken && loginTimeStamp) {
          const currentTime = new Date().getTime();
          const elapsedTime = currentTime - parseInt(loginTimeStamp);
          if (elapsedTime >= 45 * 60 * 1000) {
            localStorage.clear();
            navigate('/admin-x-page'); // 跳转到登录页面
          }
        }
      }, [navigate]);
  
  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/export_orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导出失败');
      }


            // 生成带有日期的文件名
      // const currentDate = new Date();
      // const formattedDate = currentDate.toISOString().slice(0,19).replace(/[-T:]/g, "").replace(/\..+/, '');
      // const filename = `OrderExport_${formattedDate}.xlsx`;
      // console.log(filename);

          // 生成带有中国时区的当前日期和时间的文件名
    const currentDate = new Date();
    const chinaTime = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(currentDate);

    // 将格式化的日期时间字符串转换为文件名格式
    const formattedDate = chinaTime.replace(/[年月日 :]/g, '');
    const filename = `OrderExport_${formattedDate}.xlsx`;

    console.log('生成的文件名:', filename);
    console.log('中国时间:', chinaTime);
            // 创建 Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 创建一个临时的 <a> 元素来下载文件
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('订单导出成功');
    } catch (error) {
      console.error('导出订单时出错:', error);
      alert(`导出订单失败: ${error.message}`);
      toast.error(`导出订单失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };
    




      return (
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Admin Product Management Dashboard</h1>
          <div className="grid lg:grid-cols-4 gap-8">
            {/* 用户管理模块 */}
            <div className="bg-white p-6 md:w-full rounded shadow-md">
              <div className='bg-cyan-400 rounded-lg h-16  shadow-md hover:shadow-lg cursor-pointer flex justify-center items-center text-center' onClick={() => navigate('/admin/user-management')} >
                <h2 className="text-xl font-semibold mb-4 mt-4 cursor-pointer text-center" >User Management</h2>
              </div>
              <div>
                <h3 className="text-lg font-semibold mt-4">Statistics</h3>
                <p>Total users: [Number of users]</p>
                <p>Seven-day new users: [Number of new users in seven days]</p>
              </div>
            </div>
            {/* 产品管理模块 */}
            <div className="bg-white p-6 md:w-full rounded shadow-md">
              <div className='bg-cyan-400 rounded-lg h-16  shadow-md hover:shadow-lg cursor-pointer flex justify-center items-center text-center' onClick={() => navigate('/admin/product-management')}>
                <h2 className="text-xl font-semibold mb-4 mt-4 cursor-pointer text-center" >Product Management</h2>
              </div>
              <div>
                <h3 className="text-lg font-semibold mt-4">Statistics</h3>
                <p>Total products: [Number of products]</p>
                <p>Seven-day new products: [Number of new products in seven days]</p>
              </div>
            </div>
            {/* 统计模块 */}
            <div className="bg-white p-6 md:w-full rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <p>Show various statistics about users and products.</p>
              <div>
                <h3 className="text-lg font-semibold mt-4">Order Statistics</h3>
                <p>Total orders: [Number of orders]</p>
                <p>Orders by status: [List of order statuses and counts]</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mt-4">Traffic Statistics</h3>
                <p>Unique visitors: [Number of unique visitors]</p>
                <p>Page views: [Number of page views]</p>
              </div>
              {/* <button className="bg-blue-500 text-white p-2 rounded mt-4"
               onClick={handleExportOrders}
              >Export Orders</button> */}
                      <button 
          className={`bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleExportOrders}
          disabled={isExporting}
        >
          {isExporting ? '导出中...' : '导出订单'}
        </button>
        
            </div>
            {/* 订单管理模块 */}
            <div className="bg-white p-6 md:w-full rounded shadow-md">
              <div className='bg-cyan-400 rounded-lg h-16  shadow-md hover:shadow-lg cursor-pointer flex justify-center items-center text-center' onClick={() => navigate('/admin/order-management')}>
                <h2 className="text-xl font-semibold mb-4 mt-4 cursor-pointer text-center" >Order Management</h2>
              </div>
              <ul>
                <li className="mb-2">View Orders</li>
                <li className="mb-2">Update Order Status</li>
                <li className="mb-2">Track Order</li>
              </ul>
              <div className='bg-cyan-400 rounded-lg h-16  shadow-md hover:shadow-lg cursor-pointer flex justify-center items-center text-center' onClick={() => navigate('/admin/redeem-management')}>
                <h2 className="text-xl font-semibold mb-4 mt-4 cursor-pointer text-center" >Redeem Management</h2>
              </div>
            </div>
          </div>
          <div className="fixed top-4 right-4">
            {!isLogoutClicked && (
              <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
                Logout
              </button>
            )}
          </div>
        </div>
      );
};

export default AdminProductManagement;