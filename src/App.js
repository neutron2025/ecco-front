import React, { useState, useContext, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles.css';
import LoginModal from './LoginModal';
import Header from './Header';
import UserInfo from './UserInfo';
import { AuthProvider, AuthContext } from './AuthContext';
import ProductDetail from './ProductDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const apiUrl = process.env.REACT_APP_API_URL;
const imageUrl = process.env.REACT_APP_IMAGE_URL;

const App = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, setIsLoggedIn, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess, handleLogout } = useContext(AuthContext);

  const fetchProducts = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      console.log(`获取第 ${page} 页的产品`);
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

      setProducts(prevProducts => {
        const uniqueProducts = [...prevProducts, ...newProducts].filter((product, index, self) =>
          index === self.findIndex((t) => t.ID === product.ID)
        );
        return uniqueProducts;
      });
      setTotalProducts(data.total);
      setHasMore((page * 10) < data.total);
    } catch (error) {
      console.error('获取数据时出错：', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
    if (storedLoggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const ProductCard = ({ product }) => (
    <div className='w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 sm:p-1 md:p-2 lg:p-4'>
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
  
  return(
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <InfiniteScroll
              dataLength={products.length}
              next={loadMore}
              hasMore={hasMore}
              loader={<h4 className="text-center py-4">加载中...</h4>}
              endMessage={<p className="text-center py-4">已加载全部产品</p>}
              className="flex flex-wrap mx-2 md:mx-16 p-1 md:px-8"
            >
              {products.map((product) => (
                <ProductCard key={product.ID} product={product} />
              ))}
            </InfiniteScroll>
          } />
          <Route 
            path="/userinfo"
            element={<UserInfo isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />}
          />
        </Routes>
      </main>
      <footer className="py-4 bg-gray-100">
        <div className="text-center text-xs text-gray-500">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
            青ICP备2024003149号-1
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App;