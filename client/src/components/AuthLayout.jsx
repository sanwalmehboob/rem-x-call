import { Outlet } from 'react-router-dom';
import React from 'react';

const AuthLayout = () => {
  return (
    <div className="h-screen w-full bg-white flex overflow-hidden">
      {/* Left Side - Forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-[380px] flex flex-col">
          <Outlet />
        </div>
      </div>

      {/* Right Side - Image Grid */}
      <div className="hidden lg:flex flex-col justify-center w-[450px] xl:w-[500px] h-full p-4 xl:p-6 bg-white shrink-0">
        <div className="h-full w-full grid grid-cols-2 grid-rows-4 gap-3 xl:gap-4">
          {/* We will read these from the public/images folder once you export them */}
          <ImageCell src="/images/img1.png" />
          <ImageCell src="/images/img2.png" />
          <ImageCell src="/images/img3.png" />
          
          <ImageCell src="/images/img4.png" />
          
          <ImageCell src="/images/img5.png" />
          <ImageCell src="/images/img6.png" />
          <ImageCell src="/images/img7.png" />
          <ImageCell src="/images/img8.png" />
        </div>
      </div>
    </div>
  );
};

const ImageCell = ({ src }) => {
  return (
    <div className="w-full h-full rounded-[24px] overflow-hidden bg-gray-100 relative group ring-1 ring-gray-200">
      {/* Placeholder background color just in case image is missing */}
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          // Fallback if image not found
          e.target.style.opacity = '0';
          e.target.parentElement.classList.add('bg-gray-200');
        }}
      />
    </div>
  );
}

export default AuthLayout;
