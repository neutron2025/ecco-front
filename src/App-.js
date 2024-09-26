
import React, { useState, useEffect,useMemo ,useContext,useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route ,useNavigate,useLocation,Link} from 'react-router-dom';
import './styles.css';
import LoginModal from './LoginModal'; // 假设新组件路径是这样
import Header from './Header';
import UserInfo from './UserInfo';
import { AuthProvider,AuthContext } from './AuthContext';
import ProductDetail from './ProductDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const apiUrl = process.env.REACT_APP_API_URL;
const imageUrl = process.env.REACT_APP_IMAGE_URL;

const App = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const { isLoggedIn, setIsLoggedIn, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess, handleLogout } = useContext(AuthContext);


//   useEffect(() => {
//     fetch(`${apiUrl}/api`)
//      .then(response => response.json())
//      .then(data => {
//         const filteredProducts = data.products.map(product => {
//           const mainImage = product.images.find(image => image.type === 'main');
//           return mainImage? {...product, mainImage } : product;
//         });
//         setProducts(filteredProducts);
//       })
//      .catch(error => console.error('Error fetching data:', error));

//     // 检查 localStorage 中的登录状态
//     const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
//     if (storedLoggedInStatus === 'true') {
//       setIsLoggedIn(true);
//     }


//   }, [setIsLoggedIn]);


//   const filteredProducts = useMemo(() => {
//     return products.map((product, index) => {
//       if (product.mainImage) {
//         return (
//           <>
//           {/* <div className='lg:w-1/3 md:w-1/2  sm:w-full p-4 rounded-md' key={product.ID || index}>
//             <Link to={`/product/${product.ID}`}>
//               <img
//                 src={`${imageUrl}/${product.mainImage.url}`}
//                 alt={`Main Product Image for ${product.name}`}
//                 className="w-full h-auto rounded-md border"
//               />
//               <h1 className='text-gray-600 mt-2 text-xs font-medium'>{product.description}</h1>
//               <div className="text-gray-600 flex items-center mt-2 text-sm font-medium">
//                 <h1>{product.name}</h1>
//                 <span className="mx-4"></span>
//                 <h1 className="ml-2 text-blue-500 text-lg">{product.price}</h1>
//               </div>
//             </Link>
//           </div> */}

// <div className='w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 sm:p-1 md:p-2 lg:p-4' key={product.ID || index}>
//   <Link to={`/product/${product.ID}`}>
//     <img
//       src={`${imageUrl}/${product.mainImage.url}`}
//       alt={`Main Product Image for ${product.name}`}
//       className="w-full h-auto rounded-md border"
//     />
//     <h2 className="mt-2 text-sm sm:text-base font-semibold text-gray-500 truncate">{product.name}</h2>
//     <div className="flex items-center justify-between mt-1">
//       <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1 mr-2'>{product.description}</p>
//       <span className="text-blue-600 text-sm sm:text-base font-bold whitespace-nowrap">{product.price}</span>
//     </div>
//   </Link>
// </div>
          
//           </>
//         );
//       }
//       return null;
//     });
//   }, [products]);


const fetchProducts = useCallback(async () => {
  try {
    const response = await fetch(`${apiUrl}/api/?page=${page}&limit=10`);
    const data = await response.json();
    
    if (data.products.length === 0) {
      setHasMore(false);
      return;
    }

    const newProducts = data.products.map(product => {
      const mainImage = product.images.find(image => image.type === 'main');
      return mainImage ? { ...product, mainImage } : product;
    });

    setProducts(prevProducts => [...prevProducts, ...newProducts]);
    setTotalProducts(data.total);
    setPage(prevPage => prevPage + 1);
    setHasMore(products.length + newProducts.length < data.total);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}, [page,products.length]);

useEffect(() => {
  fetchProducts();

  const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
  if (storedLoggedInStatus === 'true') {
    setIsLoggedIn(true);
  }
}, [setIsLoggedIn]);

const ProductCard = ({ product }) => (
  <div className='w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 sm:p-1 md:p-2 lg:p-4' key={product.ID}>
    <Link to={`/product/${product.ID}`}>
      <img
        src={`${imageUrl}/${product.mainImage.url}`}
        alt={`Main Product Image for ${product.name}`}
        className="w-full h-auto rounded-md border"
      />
      <h2 className="mt-2 text-sm sm:text-base font-semibold text-gray-500 truncate">{product.name}</h2>
      <div className="flex items-center justify-between mt-1">
        <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1 mr-2'>{product.description}</p>
        <span className="text-blue-600 text-sm sm:text-base font-bold whitespace-nowrap">{product.price}</span>
      </div>
    </Link>
  </div>
);

  //  return (
  //         <div>
  //         <Header 
  //           isLoggedIn={isLoggedIn} 
  //           setIsLoginModalOpen={setIsLoginModalOpen}
  //         />
  //         {isLoginModalOpen && (
  //           <LoginModal 
  //             onClose={() => setIsLoginModalOpen(false)} 
  //             setIsLoggedIn={handleLoginSuccess} 
  //           />
  //         )}
  //         <Routes>
  //           <Route path="/" element={<div className="flex flex-wrap mx-2 md:mx-16 p-1 md:px-8">{filteredProducts}</div>} />

  //           <Route 
  //             path="/userinfo"
  //             element={
  //               <>
  //                 <Header
  //                   isLoggedIn={isLoggedIn}
  //                   setIsLoginModalOpen={setIsLoginModalOpen}
  //                 />
  //                 <UserInfo isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />
  //               </>
  //             }
  //           />
           
  //         </Routes>
  //         <div className="text-center text-gray-500"> {/* 使用 Tailwind CSS 类 */}
  //               <a href="https://beian.miit.gov.cn" className="hover:text-gray-700">青ICP备2024003149号-1</a>
  //         </div>
  //         </div>
  
      

  // );
  
  return(
    <div>
       <Header 
        isLoggedIn={isLoggedIn} 
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          setIsLoggedIn={handleLoginSuccess} 
        />
      )}
        <Routes>
        <Route path="/" element={
          <InfiniteScroll
            dataLength={products.length}
            next={fetchProducts}
            hasMore={hasMore}
            loader={<h4>加载中...</h4>}
            className="flex flex-wrap mx-2 md:mx-16 p-1 md:px-8"
          >
               {products.map((product, index) => (
              <ProductCard key={`${product.ID}-${index}`} product={product} />
            ))}
          </InfiniteScroll>
        } />
         <Route 
          path="/userinfo"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                setIsLoginModalOpen={setIsLoginModalOpen}
              />
              <UserInfo isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />
            </>
          }
        />
      </Routes>
      <div className="text-center text-gray-500">
        <a href="https://beian.miit.gov.cn" className="hover:text-gray-700">青ICP备2024003149号-1</a>
      </div>

    </div>

  )
}


export default App;

