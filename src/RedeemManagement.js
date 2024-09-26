import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const RedeemManagement = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [originalOrders, setOriginalOrders] = useState({}); // 添加这行
  const navigate = useNavigate();
  const limit = 5; // 每页显示5个订单


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
      if (elapsedTime >= 30 * 60 * 1000) {
        localStorage.clear();
        navigate('/admin-x-page'); // 跳转到登录页面
      }
    }
  }, [navigate]);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const storedToken = localStorage.getItem('adminToken');
        const response = await fetch(`${apiUrl}/api/admininfo`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const userData = await response.json();
        if (response.ok) {
          // Token is valid, fetch orders
          fetchOrders();
        } else {
          // Token is invalid or expired, redirect to login
          localStorage.clear();
          navigate('/admin-x-page');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [navigate, page]);


  const calculateDaysDifference = (startDate, endDate) => {
    const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return Math.floor((end - start) / (1000 * 60 * 60 * 24));
  };


  const calculateRedemptionValue = (order) => {
    if (!order.created_at || !order.total_price) {
      return '0.00';
    }
    const issueDate = new Date(order.created_at);
    const currentDate = new Date();
    const daysDifference = calculateDaysDifference(issueDate, currentDate);
    const valueMultiplier = Math.min(daysDifference / 270, 1);
    return (order.total_price * valueMultiplier).toFixed(2);
  };

  const fetchOriginalOrder = async (orderID) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/orders/${orderID}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('获取原始订单失败');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取原始订单时出错：', error);
      return null;
    }
  };

  

  const fetchOrders = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/redemption-orders?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取赎回订单失败');
      }

      const data = await response.json();
      
      const ordersWithRedemptionValue = data.orders.map(order => ({
        ...order,
        redemptionValue: calculateRedemptionValue(order)
    
      }));

      setOrders(ordersWithRedemptionValue);
      setTotalOrders(data.total);
    } catch (error) {
      console.error('获取赎回订单时出错：', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
        const response = await fetch(`${apiUrl}/api/admin/update-redemption-status/${orderId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ status: newStatus })
          });

      if (!response.ok) {
        throw new Error('更新赎回订单状态失败');
      }

      fetchOrders();
    } catch (error) {
      console.error('更新赎回订单状态时出错：', error);
    }
  };

//   const toggleOrderExpand = (orderId) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };
const toggleOrderExpand = async (orderId) => {
    // 如果当前展开的订单就是点击的订单，则收起它
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      // 否则，展开点击的订单
      setExpandedOrder(orderId);
      
      // 找到对应的订单对象
      const order = orders.find(o => o.id === orderId);
      
      // 如果找到了订单，并且还没有获取过这个订单的原始订单信息
      if (order && !originalOrders[order.order_ref]) {
        // 获取原始订单信息
        const originalOrder = await fetchOriginalOrder(order.order_ref);
        console.log(originalOrder);
        
        // 如果成功获取到原始订单信息
        if (originalOrder) {
          // 更新原始订单信息状态
          setOriginalOrders(prev => ({...prev, [order.order_ref]: originalOrder}));
        }
      }
    }
  };


  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('确定要删除这个赎回订单吗？')) {
      try {
        const response = await fetch(`${apiUrl}/api/admin/delredemption-orders/${orderId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('删除赎回订单失败');
        }

        alert('赎回订单已成功删除');
        fetchOrders();
      } catch (error) {
        console.error('删除赎回订单时出错：', error);
        alert('删除赎回订单失败，请重试');
      }
    }
  };

  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">赎回订单管理</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          返回
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">赎回订单 ID</th>
            <th className="px-4 py-2">用户 ID</th>
            <th className="px-4 py-2">状态</th>
            <th className="px-4 py-2">创建时间</th>
            <th className="px-4 py-2">赎回价值</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr className="border-b">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.user_ref}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  {originalOrders[order.order_ref] 
                    ? calculateRedemptionValue(originalOrders[order.order_ref], order)
                    : '加载中...'}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded mr-2"
                  >
                    {expandedOrder === order.id ? '收起' : '展开'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, '已完成')}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    标记为已完成
                  </button>
                  <button
                    onClick={() => handleStatusChange(order.id, '已取消')}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    标记为已取消
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                  >
                    删除
                  </button>
                </td>
              </tr>
              {expandedOrder === order.id && (
                <tr>
                  <td colSpan="6" className="px-4 py-2 bg-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <p><strong>原始订单 ID:</strong> {order.order_ref}</p>
                      <p><strong>是否已提交:</strong> {order.is_submitted ? '是' : '否'}</p>
                      <p><strong>支付宝用户名:</strong> {order.alipay_username}</p>
                      <p><strong>支付宝账户:</strong> {order.alipay_account}</p>
                      <p><strong>钱包地址:</strong> {order.wallet_address}</p>
                      <p><strong>哈希:</strong> {order.hash}</p>
                      <p><strong>总价格:</strong> {originalOrders[order.order_ref]?.total_price || '加载中...'}</p>
 
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <div>
          <p>总订单数: {totalOrders}</p>
          <p>当前页: {page}</p>
          <p>每页显示: {limit}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            上一页
          </button>
          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            下一页
          </button>
        </div>
      </div>
      {isLoading && <p className="text-center py-4">加载中...</p>}
    </div>
  );
};

export default RedeemManagement;
