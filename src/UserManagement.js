import React,{useEffect,useState,useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
const apiUrl = process.env.REACT_APP_API_URL;
const UserManagement = () => {
    const [users,setUsers] = useState([])
    const [currentPage,setCurrentPage] = useState(1)
    const [usersPerPage] = useState(20);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newPowValue, setNewPowValue] = useState('');


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
              fetchUsers();
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
      }, [navigate,currentPage]);

      const fetchUsers = async () => {
        const token = localStorage.getItem('adminToken');
        try {
          const response = await fetch(
            `${apiUrl}/api/admin/users?page=${currentPage}&limit=${usersPerPage}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          setUsers(data.users);
          setTotalUsersCount(data.total);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };




  const handleEdit = (user) => {
    setEditingUser(user);
    setNewPowValue(user.pow);
    setIsEditModalOpen(true);
    console.log(`Edit user with id ${user}`);
  };

  const handleUpdatePow = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/admin/user/update-pow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                user_id: editingUser.id,
                pow: parseFloat(newPowValue)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '更新失败');
        }

        // 更新成功后，重新获取用户列表
        await fetchUsers();
        setIsEditModalOpen(false);
        alert('更新成功');
    } catch (error) {
        alert('更新失败: ' + error.message);
    }
};


  const handleDelete = async (userId) => {
    console.log(`Delete user with id ${userId}`);
    const isConfirmed = window.confirm('Are you sure you want to delete this user?');
    const token = localStorage.getItem('adminToken');
    if (isConfirmed) {
      try {
        const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.message === 'User deleted successfully') {
          setUsers(prevUsers => prevUsers.filter(user => user.id!== userId));
        } else {
          console.log(data);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    } else {
      console.log('Delete operation canceled.');
    }
  };

  const handleSearch = async (event) => {
    const searchValue = event.target.value;
    const token = localStorage.getItem('adminToken');
    if (searchValue) {
      try {
        const response = await fetch(`${apiUrl}/api/admin/user/${searchValue}`,{
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers([]);
          setUsers(prevUsers => [...prevUsers, data]);
          console.log(users)
        } else {
          console.error('Failed to search users');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      }
    } else {
      fetchUsers();
    }
  };
  const handleReturn = () => {
    navigate('/admin/management'); // 返回管理员面板路径，根据实际调整
  };

  const paginate = (pageNumber) => {
        
    setCurrentPage(pageNumber);
    fetchUsers()
  };




  return (
    <div>
      <h1>User Management Page</h1>
        <div className="flex items-center mb-4">
            <div className="flex-grow justify-center space-x-1 flex items-center">
                <input
                type="text"
                placeholder="Search by ID"
                onChange={handleSearch}
                className="border p-2 rounded-full mr-0 w-1/3"
                />
                <button className="bg-gray-300 rounded-full p-2 ">
                    Search
                </button>
            </div>
            <div className="flex space-x-4">
                <button className="bg-green-500 text-white p-2 rounded">Add User</button>
                <button className="bg-gray-500 text-white p-2 rounded" onClick={handleReturn} >Return</button>
            </div>
        </div>



     
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Orders</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">First Name</th>
            <th className="px-4 py-2">Last Name</th>
            <th className="px-4 py-2">Pow</th>
            <th className="px-4 py-2">Pow Address</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.phone}</td>
              <td className="border px-4 py-2">{user.orders && user.orders.length || 0}</td>
              <td className="border px-4 py-2">Address List</td>
              <td className="border px-4 py-2">{user.firstName}</td>
              <td className="border px-4 py-2">{user.lastName}</td>
              <td className="border px-4 py-2">{user.pow}</td>
              <td className="border px-4 py-2">{user.powaddr}</td>
              <td className="border px-4 py-2">{user.created_at.toLocaleString()}</td>
              <td className="border px-4 py-2">{user.id.toLocaleString()}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button onClick={() => handleEdit(user)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(user.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

       {/* 编辑模态框 */}
       {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl mb-4">编辑用户 Power</h2>
                        <input
                            type="number"
                            value={newPowValue}
                            onChange={(e) => setNewPowValue(e.target.value)}
                            className="border rounded px-2 py-1 mb-4 w-full"
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleUpdatePow}
                                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                            >
                                确认
                            </button>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}







      <div className="pagination">
  {[...Array(Math.ceil(totalUsersCount / usersPerPage))].map((_, index) => (
    <button
      key={index}
      onClick={() => {paginate(index+1)}}
      className={`px-3 py-1 mx-1 rounded ${index + 1 === currentPage? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
    >
      {index + 1}
    </button>
  ))}
</div>
    </div>
  );
};

export default UserManagement;