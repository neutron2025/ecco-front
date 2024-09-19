

import React, { useState, useEffect,useContext } from 'react';
import { useParams,useNavigate,Link } from 'react-router-dom';
import Header from './Header'; // 导入 Header 组件
import { AuthContext } from './AuthContext'; // 导入 AuthContext
import LoginModal from './LoginModal'; 


const apiUrl = process.env.REACT_APP_API_URL;
const imageUrl = process.env.REACT_APP_IMAGE_URL;
const ProductDetail = React.memo(()  => {
  const [productDetail, setProductDetail] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const { productId } = useParams();
  const { isLoggedIn, setIsLoginModalOpen,isLoginModalOpen,handleLoginSuccess } = useContext(AuthContext); // 从 AuthContext 中获取状态
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate(); 


//产品信息获取
  useEffect(() => {
    if (productId) {
      console.log('Fetching product detail for productId:', productId);
      fetch(`${apiUrl}/api/product/${productId}`)
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
            setCurrentImageUrl(`${imageUrl}/${mainImage.url}`);
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
      const response = await fetch(`${apiUrl}/api/cart/`, {
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

  if (!productDetail) {
    return <div>Loading...</div>;
  }
// 以下是产品详情的展示部分
const {
  name,
  description,
  price,
  created_at,
  size_colors,
} = productDetail;

  const formattedDate = new Date(created_at).toLocaleDateString();

  const colorVariantImages = productDetail.images.filter(img => img.type === 'color_variant').map(img => `${imageUrl}/${img.url}`);


  const handleSizeClick = (size) => {
    console.log(size)
    setSelectedSize(size);
    setSelectedColor(''); // 重置选中的颜色
  };

  const handleColorClick = (color) => {
    console.log(color)
    setSelectedColor(color);
  };
  
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/cart/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('获取购物车信息失败');
      }

      const cartData = await response.json();
      console.log("购物车数据:", cartData);

      if (cartData.CartItems && cartData.CartItems.length > 0) {
        navigate('/userinfo'); // 导航到个人主页
      } else {
        alert('购物车为空，请先添加商品');
      }
    } catch (error) {
      console.error('检查购物车失败:', error);
      alert('检查购物车失败，请稍后再试');
    }
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

      <div className="flex flex-col md:flex-row">
        <div className="product-detail w-full md:w-1/2">
          {/* Main Product Image */}
          <div className="product-image-container mx-auto my-4 md:my-8 max-w-sm md:max-w-md lg:max-w-lg">
            <img
              src={currentImageUrl}
              alt="Main Product Image"
              className="main-product-image w-full h-auto object-contain"
            />
          </div>

          {/* Color Variant Images */}
          <div className="color-variant-container mt-2 px-4">
            <h3 className="text-sm md:text-lg font-bold">选择颜色查看</h3>
            <div className="flex flex-wrap mt-2">
              {colorVariantImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Color variant ${index}`}
                  className="h-16 w-16 md:h-20 md:w-20 lg:h-32 lg:w-32 m-1 cursor-pointer"
                  style={{ objectFit: 'cover' }}
                  onClick={() => setCurrentImageUrl(url)}
                
                />
              ))}
            </div>
          </div>


        </div>

        <div className="color-size-quantity w-full md:w-1/2 flex justify-center">
        {/* ... 产品图片和信息 ... */}
        <div className="size-color-selection w-full md:w-4/5 mt-4 md:mt-8 px-4">
            {/* Product Information */}
          <div className="product-info mt-2 flex flex-row">
            <div className="product-price mr-4 text-2xl font-semibold">￥{price}</div>
            <div className="product-info-left w-4/5  md:w-1/2 text-left">
              <h2 className="text-gray-700 text-xl font-bold">{name}</h2>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
          <div className="size-selection mb-4">
            <h3 className="text-sm md:text-lg font-bold">颜色</h3>
            <div className="flex flex-wrap mt-2">
              {size_colors.map((sizeColor, index) => (
                <button
                  key={index}
                  className={`mr-2 mb-2 p-2 border ${selectedSize === sizeColor.size ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleSizeClick(sizeColor.size)}
                >
                  {sizeColor.size}
                </button>
              ))}
            </div>
          </div>
          <div className="color-selection mb-4">
            <h3 className="text-sm md:text-lg font-bold">尺寸</h3>
            <div className="flex flex-wrap mt-2">
              {selectedSize && size_colors.find(sc => sc.size === selectedSize).colors.map((color, index) => (
                <button
                  key={index}
                  className={`mr-2 mb-2 p-2 border ${selectedColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleColorClick(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          <div className="quantity-selection mb-4">
          <h3 className="text-sm md:text-lg font-bold">数量</h3>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="mt-2 p-2 border border-gray-300 rounded"
            />
          </div>
          <div className='add-button flex '>
          <button
            className={`my-4 mx-2 px-4 py-2 rounded ${isAddToCartEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            onClick={handleAddToCart}
            disabled={!isAddToCartEnabled}
          >
            添加到购物车
          </button>
          <button
              className="my-4 mx-2 px-4 py-2 rounded bg-green-500 text-white"
              onClick={handleCheckout}
            >
              立即去结算
            </button>
          </div>

        </div>
        </div>
      </div>



    </div>

  )

});



export default ProductDetail;