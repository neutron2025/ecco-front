
import React, { useState, useEffect,useMemo ,useContext } from 'react';
import { BrowserRouter as Router, Routes, Route ,useNavigate,useLocation,Link} from 'react-router-dom';
import './styles.css';
import LoginModal from './LoginModal'; // 假设新组件路径是这样
import Header from './Header';
import UserInfo from './UserInfo';
import { AuthProvider,AuthContext } from './AuthContext';
import ProductDetail from './ProductDetail';

const App = ({apiUrl}) => {
  const [products, setProducts] = useState([]);
  const { isLoggedIn, setIsLoggedIn, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess, handleLogout } = useContext(AuthContext);


  useEffect(() => {
    fetch(`${apiUrl}/api`)
     .then(response => response.json())
     .then(data => {
        const filteredProducts = data.products.map(product => {
          const mainImage = product.images.find(image => image.type === 'main');
          return mainImage? {...product, mainImage } : product;
        });
        setProducts(filteredProducts);
      })
     .catch(error => console.error('Error fetching data:', error));

    // 检查 localStorage 中的登录状态
    const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
    if (storedLoggedInStatus === 'true') {
      setIsLoggedIn(true);
    }


  }, [setIsLoggedIn]);


  const filteredProducts = useMemo(() => {
    return products.map((product, index) => {
      if (product.mainImage) {
        return (
          <div className='lg:w-1/3 md:w-1/2  sm:w-full p-4 rounded-md' key={product.ID || index}>
            <Link to={`/product/${product.ID}`}>
              <img
                src={`${apiUrl}/${product.mainImage.url}`}
                alt={`Main Product Image for ${product.name}`}
                className="w-full h-auto rounded-md border"
              />
              <h1 className='mt-2 text-sm font-medium'>{product.description}</h1>
              <div className="flex items-center mt-2 text-sm font-medium">
                <h1>{product.name}</h1>
                <span className="mx-4"></span>
                <h1 className="ml-2 text-blue-500 text-lg">{product.price}</h1>
              </div>
            </Link>
          </div>
        );
      }
      return null;
    });
  }, [products]);


   return (
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
            <Route path="/" element={<div className="flex flex-wrap">{filteredProducts}</div>} />
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
          </div>
  
      

  );
  
}


export default App;

