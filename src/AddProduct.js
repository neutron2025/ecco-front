import React,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const apiUrl = process.env.REACT_APP_API_URL;

const AddProduct = () => {

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

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

 
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [mainImage, setMainImage] = useState(null);
    const [colorVariantImages, setColorVariantImages] = useState([]);
    const [introductoryImages, setIntroductoryImages] = useState([]);
    const [sizeColors, setSizeColors] = useState([]); // 用于存储尺寸和颜色信息
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('description', description);
      formData.append('price', price);
      if (mainImage) {
        formData.append('main_image', mainImage);
      }
      colorVariantImages.forEach((image) => formData.append('color_variant_images', image));
      introductoryImages.forEach((image) => formData.append('introductory_images', image));


  // 添加尺寸颜色数据
  sizeColors.forEach((sizeColor, index) => {
    formData.append(`size_colors[${index}][size]`, sizeColor.size);
    sizeColor.colors.forEach((color, colorIndex) => {
      formData.append(`size_colors[${index}][colors][]`, color); // 使用索引为颜色创建数组
    });
  });

  console.log('Form data:', formData);
  console.log(formData.size_colors)
 
      const adminToken = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`${apiUrl}/api/admin/addproduct`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        if (response.ok) {
          toast.success(response.message)
          navigate('/admin/product-management');
        } else {
          console.error('Failed to add product ---');
          const errorData = await response.json();
            setErrorMessage(errorData.error || 'Failed to add product');
            toast.error(errorData.error || 'Failed to add product');
        }
      } catch (error) {
        setErrorMessage("error")
        console.error('Error submitting product:', error);
      }
    };
  
    const handleMainImageChange = (e) => {
      const file = e.target.files[0];
      setMainImage(file);
    };
  
    const handleColorVariantImagesChange = (e) => {
      const files = Array.from(e.target.files);
      setColorVariantImages(files);
    };
  
    const handleIntroductoryImagesChange = (e) => {
      const files = Array.from(e.target.files);
      setIntroductoryImages(files);
    };
  

    const removeMainImage = () => {
        setMainImage(null);
      };
    
      const removeColorVariantImage = (index) => {
        const newColorVariantImages = [...colorVariantImages];
        newColorVariantImages.splice(index, 1);
        setColorVariantImages(newColorVariantImages);
      };
    
      const removeIntroductoryImage = (index) => {
        const newIntroductoryImages = [...introductoryImages];
        newIntroductoryImages.splice(index, 1);
        setIntroductoryImages(newIntroductoryImages);
      };





  
 // 添加新尺寸和颜色集合
const addSizeColor = () => {
    setSizeColors(prev => [...prev, { size: '', colors: [''] }]);
  };

  // 定义 removeSizeColor 函数
const removeSizeColor = (indexToRemove) => {
    const filteredSizeColors = sizeColors.filter((_, index) => index !== indexToRemove);
    setSizeColors(filteredSizeColors);
  };
   // 定义 handleColorChange 函数
const handleColorChange = (sizeIndex, colorIndex, colorValue) => {
    const newSizeColors = [...sizeColors];
    const colors = newSizeColors[sizeIndex].colors;
    colors[colorIndex] = colorValue;
    newSizeColors[sizeIndex].colors = colors;
    setSizeColors(newSizeColors);
  };
    // 定义 handleAddColor 函数
    const handleAddColor = (sizeIndex) => {
        const newSizeColors = [...sizeColors];
        const newColors = newSizeColors[sizeIndex].colors;
        newColors.push(''); // 添加一个空字符串作为新颜色的占位符
        newSizeColors[sizeIndex].colors = newColors;
        setSizeColors(newSizeColors);
      };

        // 定义 handleRemoveColor 函数
  const handleRemoveColor = (sizeIndex, colorIndex) => {
    const newSizeColors = [...sizeColors];
    const colors = newSizeColors[sizeIndex].colors;
    colors.splice(colorIndex, 1); // 移除指定索引的颜色
    newSizeColors[sizeIndex].colors = colors;
    setSizeColors(newSizeColors);
  };
  const handleSizeColorChange = (index, field, value) => {
    const newSizeColors = [...sizeColors];
    newSizeColors[index][field] = value;
    setSizeColors(newSizeColors);
  };


      return (
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Add Product</h1>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex">
              <div className="w-1/3">
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Product Name:</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-semibold">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded resize-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold">Price:</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
             <div className="w-2/3">
                <h2 className="text-xl font-bold mb-4">Size and Colors</h2>
                {sizeColors.map((sizeColor, index) => (
                    <div key={index} className="flex items-center mb-4">
                    {/* Size input field */}
                    <input
                        type="text"
                        placeholder="Color"
                        value={sizeColor.size}
                        onChange={(e) => handleSizeColorChange(index, 'size', e.target.value)}
                        className="border p-2 rounded mr-2 flex-grow w-16"
                    />
                    {/* Color inputs and "Remove Color" buttons */}
                    <div className="flex flex-wrap">
                        {sizeColor.colors.map((color, colorIndex) => (

                        <div key={colorIndex} className="relative mr-2">
                            <input
                            type="text"
                            placeholder="Size"
                            value={color}
                            onChange={(e) => handleColorChange(index, colorIndex, e.target.value)}
                            className="border p-2 rounded w-32"
                            />
                            {colorIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveColor(index, colorIndex)}

                                className="absolute top-0 right-0 text-red-500  bg-white rounded-full w-6 h-6 flex items-center justify-center"
                          style={{ transform: 'translate(50%, -50%)' }}
                            >
                               &times;

                            </button>
                            )}
                        </div>
                        ))}
                        {/* "Add Color" button */}
                        <button
                        type="button"
                        onClick={() => handleAddColor(index)}
                        className="bg-blue-500 text-white p-2 rounded"
                        >
                        Add Color
                        </button>
                    </div>
                    {/* "Remove Size" button */}
                    <button
                        type="button"
                        onClick={() => removeSizeColor(index)}
                        className="text-red-500 ml-2"
                    >
                        Remove Size
                    </button>
                    </div>
                ))}
                {/* "Add Size and Color" button */}
                <button
                    type="button"
                    onClick={addSizeColor}
                    className="bg-green-500 text-white p-2 rounded w-full mt-4"
                >
                    Add Size and Color
                </button>
                </div>
            </div>
            <div className="flex items-center">
              <label className="block text-lg font-semibold mr-2">Main Image:</label>
              <input type="file" onChange={handleMainImageChange} className="border p-2" />
              {mainImage && (
                <div>
                  <img src={URL.createObjectURL(mainImage)} alt="Main Image Preview" className="w-24 h-24 ml-2" />
                  <button onClick={removeMainImage} className="text-red-500 ml-2">Remove</button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <label className="block text-lg font-semibold mr-2">Color Variant Images:</label>
              <input
                type="file"
                multiple
                onChange={handleColorVariantImagesChange}
                className="border p-2"
              />
              {colorVariantImages.length > 0 && (
                <div className="flex flex-wrap ml-2">
                  {colorVariantImages.map((image, index) => (
                    <div key={index}>
                      <img src={URL.createObjectURL(image)} alt={`Color Variant ${index}`} className="w-16 h-16 object-cover mr-2" />
                      <button onClick={() => removeColorVariantImage(index)} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <label className="block text-lg font-semibold mr-2">Introductory Images:</label>
              <input
                type="file"
                multiple
                onChange={handleIntroductoryImagesChange}
                className="border p-2"
              />
              {introductoryImages.length > 0 && (
                <div className="flex flex-wrap ml-2">
                  {introductoryImages.map((image, index) => (
                    <div key={index}>
                      <img src={URL.createObjectURL(image)} alt={`Introductory ${index}`} className="w-16 h-16 object-cover mr-2" />
                      <button onClick={() => removeIntroductoryImage(index)} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">Add Product</button>
          </form>
        </div>
      );



};

export default AddProduct;