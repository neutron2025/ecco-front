import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
const apiUrl = process.env.REACT_APP_API_URL;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [shippingItem, setShippingItem] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const navigate = useNavigate();

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
              // Token is valid, fetch users
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
      }, [navigate,page,limit,filter]);


  const fetchOrders = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/allorders?page=${page}&limit=${limit}${filter !== 'all' ? `&payment_status=${filter}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
      if (!response.ok) {
        throw new Error('获取订单失败');
      }
      const data = await response.json();
      setOrders(data.orders||[]);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('获取订单出错:', error);
      setOrders([]);
      setTotalPages(1);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);// 重置页码到第一页
  };    
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  //更新订单状态
  const handleShipItem = (orderId, productId) => {
    setShippingItem({ orderId, productId });
    console.log(orderId,productId)
  };
//提交快递单号
  const handleConfirmShipping = async () => {
    if (!trackingNumber.trim()) {
      alert('请输入快递单号');
      return;
    }
    try {
        // 第一步：更新发货状态
        const statusResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/update-ship-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            order_id: shippingItem.orderId,
            product_id: shippingItem.productId,
            status: '已发货'
          })
        });
  
        if (!statusResponse.ok) {
          throw new Error('更新发货状态失败');
        }
         // 第二步：更新快递单号
      const deliverResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/update-deliver-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          order_id: shippingItem.orderId,
          product_id: shippingItem.productId,
          deliver_id: trackingNumber
        })
      });

      if (!deliverResponse.ok) {
        throw new Error('更新快递单号失败');
      }
         // 更新本地状态
         setOrders(orders.map(order => {
            if (order.id === shippingItem.orderId) {
              const updatedItems = order.items.map(item => {
                if (item.ProductRef === shippingItem.productId) {
                  return {
                    ...item,
                    shipping_status: '已发货',
                    deliverid: trackingNumber
                  };
                }
                return item;
              });
              return { ...order, items: updatedItems };
            }
            return order;
          }));
    
          setShippingItem(null);
          setTrackingNumber('');
          alert('发货成功！');
        } catch (error) {
          console.error('发货出错:', error);
          alert('发货失败，请重试');
        }
    };

    const [editingTrackingNumber, setEditingTrackingNumber] = useState(null);

    const handleEditTrackingNumber = async (orderId, productId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/get-deliver-id?order_id=${orderId}&product_id=${productId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
  
        if (!response.ok) {
          throw new Error('获取快递单号失败');
        }
  
        const data = await response.json();
        setEditingTrackingNumber({ orderId, productId, trackingNumber: data.deliver_id });
      } catch (error) {
        console.error('获取快递单号出错:', error);
        alert('获取快递单号失败，请重试');
      }
    };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.payment_status === filter;
  });
  const handleUpdateTrackingNumber = async () => {
    if (!editingTrackingNumber.trackingNumber.trim()) {
      alert('请输入快递单号');
      return;
    }
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/update-deliver-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            order_id: editingTrackingNumber.orderId,
            product_id: editingTrackingNumber.productId,
            deliver_id: editingTrackingNumber.trackingNumber
          })
        });
  
        if (!response.ok) {
          throw new Error('更新快递单号失败');
        }
  
        // 更新本地状态
        setOrders(orders.map(order => {
          if (order.id === editingTrackingNumber.orderId) {
            const updatedItems = order.items.map(item => {
              if (item.product_ref === editingTrackingNumber.productId) {
                return { ...item, deliverid: editingTrackingNumber.trackingNumber };
              }
              return item;
            });
            return { ...order, items: updatedItems };
          }
          return order;
        }));
        setEditingTrackingNumber(null);
        alert('快递单号更新成功！');
      } catch (error) {
        console.error('更新快递单号出错:', error);
        alert('更新快递单号失败，请重试');
      }
    };

 
    
    const clearUnpaidOrders = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/admin/clear-unpaid-orders`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          });
    
          if (!response.ok) {
            throw new Error('清理待支付订单失败');
          }
    
          const result = await response.json();
          alert(`清理待支付订单成功，共清理${result.deleted_count}个订单`);
          
          // 刷新订单列表
          fetchOrders();
        } catch (error) {
          console.error('清理待支付订单出错:', error);
          alert('清理待支付订单失败，请重试');
        }
      };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">订单管理</h1>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="filter" className="mr-2">筛选订单：</label>
          <select id="filter" value={filter} onChange={handleFilterChange} className="border p-1">
            <option value="all">全部</option>
            <option value="待支付">待支付</option>
            <option value="已支付">已支付</option>
            {/* 根据实际情况添加更多状态 */}
          </select>
        </div>
        <div>
          <button onClick={clearUnpaidOrders} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            清理待支付订单
          </button>

          <div className="text-xs text-gray-500">超时4h以上</div>

        </div>
      </div>
      <div className="flex">
        <div className="w-2/5 pr-4">
          <h2 className="text-xl font-semibold mb-2">订单列表</h2>
          {orders && orders.length > 0 ? (
        //   <ul className="space-y-2">
        //     {filteredOrders.map(order => (
        //     <li 
        //     key={order.id} 
        //     className={`border p-2 cursor-pointer hover:bg-gray-100 ${
        //       order.payment_status === '已支付' && order.items.some(item => item.shipping_status === '待发货')
        //         ? 'bg-yellow-200' 
        //         : ''
        //     }`}
        //     onClick={() => handleOrderClick(order)}
        //     >
        //     订单号: {order.id} - 支付状态: {order.payment_status} - 总金额: ¥{order.total_price.toFixed(2)}
        //   </li>
        //     ))}
        //   </ul>

<ul className="space-y-2">
  {orders && orders.map(order => {
    if (!order || !order.items) {
      return null; // 如果订单或订单项为空，跳过这个订单
    }

    const allItemsShipped = order.items.every(item => item.shipping_status === '已发货');
    const allItemsPaid = order.payment_status === '已支付';
    const bgColor = allItemsShipped && allItemsPaid ? 'bg-green-100' : 
                    (order.payment_status === '已支付' && order.items.some(item => item.shipping_status === '待发货')
                      ? 'bg-yellow-200' 
                      : '');

    return (
      <li 
        key={order.id} 
        className={`border p-2 cursor-pointer hover:bg-gray-100 ${bgColor}`}
        onClick={() => handleOrderClick(order)}
      >
        订单号: {order.id} - 支付状态: {order.payment_status} 
        - 发货状态: {allItemsShipped ? '全部已发货' : '部分待发货'} 
        - 总金额: ¥{order.total_price ? order.total_price.toFixed(2) : '0.00'}
      </li>
    );
  })}
</ul>
           ) : (
            <p>暂无订单数据</p>
          )}
          <div className="mt-4 flex justify-between">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page === 1}
              className="px-2 py-1 border rounded"
            >
              上一页
            </button>
            <span>第 {page} 页，共 {totalPages} 页</span>
            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page === totalPages}
              className="px-2 py-1 border rounded"
            >
                 下一页
            </button>
          </div>
        </div>
        <div className="w-3/5 pl-4">
          <h2 className="text-xl font-semibold mb-2">订单详情</h2>
          {selectedOrder ? (
            <div>
              <p>订单号: {selectedOrder.id}</p>
              <p>用户ID: {selectedOrder.user_ref}</p>
              <p>创建时间: {format(new Date(selectedOrder.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
              <p>支付状态: {selectedOrder.payment_status}</p>
              <p>总金额: ¥{selectedOrder.total_price.toFixed(2)}</p>
              <h3 className="font-semibold mt-2">商品列表:</h3>
              {selectedOrder.items ? (
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="mb-2">
                    <div className="text-xs text-gray-500">商品ID: {item.product_ref}</div>
                    <div>
                      数量: {item.quantity} - 颜色: {item.size} - 尺寸: {item.color} - 单价: ¥{item.price.toFixed(2)} - 运送状态: {item.shipping_status} {item.deliverid && ` - 快递单号: ${item.deliverid}`}

                      {/* <button
                    onClick={() => handleEditTrackingNumber(selectedOrder.id, item.product_ref)}
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    编辑快递单号
                  </button> */}
                                {selectedOrder.payment_status === '已支付' && item.shipping_status === '已发货' && (
                    <button
                      onClick={() => handleEditTrackingNumber(selectedOrder.id, item.product_ref)}
                      className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      编辑快递单号
                    </button>
                  )}
                    </div>
                    {item.shipping_status === '待发货' && selectedOrder.payment_status === '已支付' && (
                        <button 
                        onClick={() => handleShipItem(selectedOrder.id, item.product_ref)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                        发货
                        </button>
                     )}

                  </li>
                  ))}
                </ul>
              ) : (
                <p>无商品信息</p>
              )}
            </div>
          ) : (
            <p>请选择一个订单查看详情</p>
          )}
          {editingTrackingNumber && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">编辑快递单号</h3>
            <input 
              type="text" 
              value={editingTrackingNumber.trackingNumber} 
              onChange={(e) => setEditingTrackingNumber({...editingTrackingNumber, trackingNumber: e.target.value})}
              className="border p-2 mb-2 w-full"
            />
            <div className="flex justify-end">
              <button 
                onClick={() => setEditingTrackingNumber(null)} 
                className="bg-gray-300 text-black px-3 py-1 rounded mr-2"
              >
                取消
              </button>
              <button 
                onClick={handleUpdateTrackingNumber} 
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* 快递单号输入模态框 */}
      {shippingItem && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-5 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">输入快递单号</h3>
                        <div className="text-xs text-gray-500">商品ID: {shippingItem.orderId}</div>
                        <input 
                            type="text" 
                            value={trackingNumber} 
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="border p-2 mb-2 w-full"
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShippingItem(null)} 
                                className="bg-gray-300 text-black px-3 py-1 rounded mr-2"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleConfirmShipping} 
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            )}





    </div>
  );


};

export default OrderManagement;