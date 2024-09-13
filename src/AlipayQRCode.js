import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AlipayQRCode = ({ qrCodeUrl }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">请扫描二维码完成支付</h2>
      <QRCodeSVG 
        value={qrCodeUrl} 
        size={256}  // 你可以调整大小
        level={"H"}  // 错误校正级别，可选 L, M, Q, H
        includeMargin={true}
      />
    </div>
  );
};

export default AlipayQRCode;