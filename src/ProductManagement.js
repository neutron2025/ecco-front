import React,{useState,useEffect,useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
const apiUrl = process.env.REACT_APP_API_URL;
const ProductManagement = () => {

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(8);
    const baseImageUrl=`${apiUrl}/`
    const [totalProductsCount, setTotalProductsCount] = useState(0);

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



    useEffect(()=>{
    const checkAdminStatus=async()=>{
        try {
            const storedToken = localStorage.getItem('adminToken');
            const response = await fetch(`${apiUrl}/api/admininfo`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`
                }
            });
            const userData = await response.json();
            if (response.ok) {
                // Token is valid, fetch products
                fetchProducts();
            } else {
                // Token is invalid or expired, redirect to login
                localStorage.clear();
                navigate('/admin-x-page');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }
    checkAdminStatus(); // 在这里调用 checkAdminStatus
    },[navigate,currentPage])



    const fetchProducts = async () => {
        const token = localStorage.getItem('adminToken');
        try {
        const response = await fetch(`${apiUrl}/api/admin/products?page=${currentPage}&limit=${productsPerPage}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        setProducts(data.products);
        setTotalProductsCount(data.total); // 设置总产品数量


        } catch (error) {
        console.error('Error fetching products:', error);
        }
    };






 

  const handleEdit = (productId) => {
    console.log(`Edit product with id ${productId}`);
    // 导航到编辑产品的路由，并传递 productId 作为查询参数
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleDelete = async (productId) => {
    console.log(`Delete product with id ${productId}`);

      // 使用 confirm 函数弹出确认框
  const isConfirmed = window.confirm('Are you sure you want to delete this product?');
    const token = localStorage.getItem('adminToken');
    if (isConfirmed) {
        // 如果用户确认，执行删除操作
        try {
            // 发送 DELETE 请求到服务器
            const response = await fetch(`${apiUrl}/api/admin/delproduct/${productId}`, {
              method: 'DELETE', // 明确指定请求方法为 DELETE
              headers: {
                  Authorization: `Bearer ${token}`
              }
            });
        
            if (!response.ok) {
              // 如果服务器响应状态码不是 2xx，抛出错误
              throw new Error(`Error: ${response.status}`);
            }
        
            // 解析响应为 JSON
            const data = await response.json();
        
            if (data.message === "Product deleted successfully") {
              // 如果产品删除成功，执行 UI 更新或其他逻辑
              console.log(data.message);
              // 例如，从产品列表中移除已删除的产品
              setProducts(prevProducts => prevProducts.filter(product => product.ID !== productId));
            } else {
              // 处理其他响应消息
              console.log(data);
            }
          } catch (error) {
            // 网络请求失败或响应不是 ok 时的错误处理
            console.error('Error deleting product:', error);
          }

        } else {
            // 如果用户取消，可以在这里执行其他逻辑（如果有的话）
            console.log('Delete operation canceled.');
          }
  
    
  };

  const handleSearch = (event) => {
    // 这里可以根据搜索值进行实际的搜索逻辑处理
  const searchValue = event.target.value;

  // 假设我们使用一个简单的过滤逻辑来搜索产品
  // 这里只是一个示例，您可能需要根据实际的搜索需求来实现搜索逻辑
  const filteredProducts = products.filter(product =>
    product.ID.toString().includes(searchValue) || 
    product.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    //  // 阻止默认的表单提交行为，如果搜索是在表单中
    event?.preventDefault();
    // 更新产品列表状态以显示搜索结果
    setProducts(filteredProducts);

  };


  const handleReturn = () => {
    navigate('/admin/management'); // 返回管理员面板路径，根据实际调整
  };
  
  const paginate = (pageNumber) => {
        
        setCurrentPage(pageNumber);
        fetchProducts()
      };
  

return (
    <div>
        <h1>Product Management Page</h1>
        <div className="flex items-center mb-4">
            <div className="flex-grow justify-center space-x-1 flex items-center">
                <input
                    type="text"
                    placeholder="Search by ID"
                    onChange={handleSearch}
                    className="border p-2 rounded-full mr-0 w-1/3"
                />
                <button className="bg-gray-300 rounded-full p-2">
                    Search
                </button>
            </div>
            <div className="flex space-x-4">
                <button className="bg-green-500 text-white p-2 rounded" onClick={() => navigate('/admin/add-product')}>
                    Add Product
                </button>
                <button className="bg-gray-500 text-white p-2 rounded" onClick={handleReturn}>
                    Return
                </button>
            </div>
        </div>
        <table className="table-auto w-full">
            <thead>
                <tr>
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Inventory</th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>

                {products && products.length > 0? products.map(product => (
                    <tr key={product.ID} className="h-16">
                        <td className="border px-4 py-2">
                            {product.images && product.images.length > 0 && (
                                <img
                                    src={`${baseImageUrl}${product.images.find(image => image.main_image).url}`}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover"
                                />
                            )}
                        </td>
                        <td className="border px-4 py-2">{product.name}</td>
                        <td className="border px-4 py-2">{product.description}</td>
                        <td className="border px-4 py-2">{product.price}</td>
                        <td className="border px-4 py-2">{product.created_at}</td>
                        <td className="border px-4 py-2">{product.inventory}</td>
                        <td className="border px-4 py-2">{product.ID}</td>
                        <td className="border px-4 py-2 relative space-x-2">
                            <button style={{ position: 'relative', top: '-2px' }} onClick={() => handleEdit(product.ID)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button style={{ position: 'relative', top: '-2px' }} onClick={() => handleDelete(product.ID)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>


                )):<tr><td>没有数据可显示。</td></tr>}

            </tbody>
        </table>
        {/* <div className="pagination">
            {[...Array(Math.ceil(totalProductsCount/ productsPerPage))].map((_, index) => (
                <button key={index} onClick={() => paginate(index + 1)}>
                    {index + 1}
                </button>
            ))}
        </div> */}

<div className="pagination">
  {[...Array(Math.ceil(totalProductsCount / productsPerPage))].map((_, index) => (
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
}

export default ProductManagement;