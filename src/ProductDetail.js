
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


const ProductDetail = ({}) => {
  const [productDetail, setProductDetail] = useState(null);
  const { productId } = useParams();


  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:3000/product/${productId}`)
       .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
       .then(data => setProductDetail(data))
       .catch(error => console.error('Error fetching product detail:', error));
    }
  }, [productId]);

  console.log(productDetail)

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

  const mainImageUrl = `http://localhost:3000/${productDetail.images.find(img => img.main_image).url}`;
  const colorVariantImages = productDetail.images.filter(img => img.type === 'color_variant').map(img => `http://localhost:3000/${img.url}`);

  return (
    <div className="product-detail">
      {/* Main Product Image */}
      <div className="product-image-container w-1/3">
        <img
          src={mainImageUrl}
          alt="Main Product Image"
          className="main-product-image w-full h-auto"
        />
      </div>

      {/* Product Information */}
      <div className="product-info mt-4">
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-gray-700">{description}</p>
        <div className="product-price text-2xl font-semibold">￥{price}</div>
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
            />
          ))}
        </div>
      </div>
    </div>
  );

};

export default ProductDetail;