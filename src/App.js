import React, { useState, useEffect,useMemo  } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './styles.css';
import LoginModal from './LoginModal'; // 假设新组件路径是这样
import Header from './Header';

const ProductImages = () => {
  const [products, setProducts] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);  
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    fetch('http://localhost:3000')
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

  }, []);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // 获取当前时间戳并存储到 localStorage
    const loginTimeStamp = new Date().getTime();
    localStorage.setItem('loginTimeStamp', loginTimeStamp);
    closeLoginModal();
  };

  

  // return (
  //  <div>

  //     {/* <header className="bg-gray-800 p-4 flex justify-between items-center">
  //       <h1 className="text-white">Product Gallery</h1>
  //       <button className="text-white" onClick={handleLoginClick}>Login</button>
  //     </header> */}

  //     <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

  //     {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
  //     {/* {isLoginModalOpen && (
  //       <LoginModal onClose={closeLoginModal} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
  //     )} */}
  //     <div className=" flex flex-wrap">

  //     {products.map((product, index) => (
  //       product.mainImage && (
  //         <div className='w-1/3 p-4  rounded-md'  key={product.ID || index}>
  //           {/* <a href={`/product/${product.ID}`} target="_blank" ></a> */}
  //           <Link to={`/product/${product.ID}`}>View Product


  //           <img
  //             src={`http://localhost:3000/${product.mainImage.url}`}
  //             alt={`Main Product Image for ${product.name}`}
  //              className="w-full h-auto rounded-md border"
  //           />
  //           <h1 className='mt-2 text-sm font-medium'>{product.description}</h1>

  //           <div className="flex items-center mt-2 text-sm font-medium">
  //             <h1>{product.name}</h1>
  //             <span className="mx-4"></span>
  //             <h1 className="ml-2 text-blue-500 text-lg ">{product.price}</h1>
  //           </div>
  //           </Link>
    
  //         </div>
  //       )
  //     ))}
  //   </div>
  //   </div>
  // );

  const filteredProducts = useMemo(() => {
    return products.map((product, index) => {
      if (product.mainImage) {
        return (
          <div className='lg:w-1/3 md:w-1/2  sm:w-full p-4 rounded-md' key={product.ID || index}>
            <Link to={`/product/${product.ID}`}>
              <img
                src={`http://localhost:3000/${product.mainImage.url}`}
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
    // 确保这个最外层的 div 正确闭合
    <div>
      <Header 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        setIsLoginModalOpen={setIsLoginModalOpen}
        handleLoginClick={handleLoginClick}
      />
      {isLoginModalOpen && (
        <LoginModal onClose={closeLoginModal} isLoggedIn={isLoggedIn} setIsLoggedIn={handleLoginSuccess} />
      )}
      <div className="flex flex-wrap">
        {filteredProducts}
      </div>
    </div>
  );
  
}

export default ProductImages;