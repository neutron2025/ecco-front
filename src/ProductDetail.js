

import React, { useState, useEffect,useContext } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header'; // 导入 Header 组件
import { AuthContext } from './AuthContext'; // 导入 AuthContext
import LoginModal from './LoginModal'; 


const ProductDetail = React.memo(()  => {
  const [productDetail, setProductDetail] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const { productId } = useParams();
  const { isLoggedIn, setIsLoginModalOpen,isLoginModalOpen,handleLoginSuccess } = useContext(AuthContext); // 从 AuthContext 中获取状态
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(false);
  const [quantity, setQuantity] = useState(1);


//产品信息获取
  useEffect(() => {
    if (productId) {
      console.log('Fetching product detail for productId:', productId);
      fetch(`http://localhost:3000/api/product/${productId}`)
       .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
       .then(data => {
        setProductDetail(data)
        const mainImage = data.images.find(img => img.main_image);
          if (mainImage) {
            setCurrentImageUrl(`http://localhost:3000/${mainImage.url}`);
          }
      })
       .catch(error => console.error('Error fetching product detail:', error));
    }
  }, [productId]);

//产品信息是否添加购物车
  useEffect(() => {
    setIsAddToCartEnabled(selectedSize !== '' && selectedColor !== '' && quantity > 0);
  }, [selectedSize, selectedColor, quantity]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          products: [{
            product_id: productId,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor
          }]
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.message === "Product added to cart successfully") {
        alert('商品已成功添加到购物车！');
        // 可以在这里更新购物车图标或数量
      }
    } catch (error) {
      console.error('添加到购物车失败:', error);
      alert('添加到购物车失败，请稍后再试。');
    }
  };



  console.log(productDetail)

  console.log("productDetail")


  if (!productDetail) {
    return <div>Loading...</div>;
  }
// 以下是产品详情的展示部分
const {
  ID,
  name,
  description,
  price,
  created_at,
  rating,
  images,
  size_colors,
  inventory
} = productDetail;

  const formattedDate = new Date(created_at).toLocaleDateString();


  // const mainImageUrl = `http://localhost:3000/${productDetail.images.find(img => img.main_image).url}`;
  const colorVariantImages = productDetail.images.filter(img => img.type === 'color_variant').map(img => `http://localhost:3000/${img.url}`);


  const handleSizeClick = (size) => {
    console.log(size)
    setSelectedSize(size);
    setSelectedColor(''); // 重置选中的颜色
  };

  const handleColorClick = (color) => {
    console.log(color)
    setSelectedColor(color);
  };
  
  return (
    <div>
       <Header isLoggedIn={isLoggedIn} setIsLoginModalOpen={setIsLoginModalOpen} />  {/* 添加 Header 组件 */}
       {isLoginModalOpen && (
            <LoginModal 
              onClose={() => setIsLoginModalOpen(false)} 
              setIsLoggedIn={handleLoginSuccess} 
            />
          )}
      <div className="flex">
        <div className="product-detail w-1/2">
          {/* Main Product Image */}
          <div className="product-image-container ">
            <img
              src={currentImageUrl}
              alt="Main Product Image"
              className="main-product-image w-full h-auto"
            />
          </div>

          {/* Color Variant Images */}
          <div className="color-variant-container mt-8">
            <h3 className="text-lg font-bold">Choose a color</h3>
            <div className="flex mt-2">
              {colorVariantImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Color variant ${index}`}
                  className="h-24 w-24 mr-2 cursor-pointer"
                  style={{ objectFit: 'cover' }}
                  onClick={() => setCurrentImageUrl(url)}
                
                />
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="product-info mt-4">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-700">{description}</p>
            <div className="product-price text-2xl font-semibold">￥{price}</div>
          </div>
        </div>

        {/* <div className="size-color-selection w-1/3 mt-8">
          <div className="size-selection mb-4">
            <h3 className="text-lg font-bold">Size</h3>
            <div className="flex mt-2">
              {size_colors.map((sizeColor, index) => (
                <button
                  key={index}
                  className={`mr-2 p-2 border ${selectedSize === sizeColor.size ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleSizeClick(sizeColor.size)}
                >
                  {sizeColor.size}
                </button>
              ))}
            </div>
          </div>
          <div className="color-selection">
            <h3 className="text-lg font-bold">Color</h3>
            <div className="flex mt-2">
              {selectedSize && size_colors.find(sc => sc.size === selectedSize).colors.map((color, index) => (
                <button
                  key={index}
                  className={`mr-2 p-2 border ${selectedColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleColorClick(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div> */}

        <div className="flex">
        {/* ... 产品图片和信息 ... */}
        <div className="size-color-selection w-1/3 mt-8">
          <div className="size-selection mb-4">
            <h3 className="text-lg font-bold">颜色</h3>
            <div className="flex mt-2">
              {size_colors.map((sizeColor, index) => (
                <button
                  key={index}
                  className={`mr-2 p-2 border ${selectedSize === sizeColor.size ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleSizeClick(sizeColor.size)}
                >
                  {sizeColor.size}
                </button>
              ))}
            </div>
          </div>
          <div className="color-selection mb-4">
            <h3 className="text-lg font-bold">尺寸</h3>
            <div className="flex mt-2">
              {selectedSize && size_colors.find(sc => sc.size === selectedSize).colors.map((color, index) => (
                <button
                  key={index}
                  className={`mr-2 p-2 border ${selectedColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleColorClick(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          <div className="quantity-selection mb-4">
          <h3 className="text-lg font-bold">数量</h3>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="mt-2 p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            className={`mt-4 px-4 py-2 rounded ${isAddToCartEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            onClick={handleAddToCart}
            disabled={!isAddToCartEnabled}
          >
            添加到购物车
          </button>
        </div>
      </div>

      </div>

    </div>

  );


});


export default ProductDetail;