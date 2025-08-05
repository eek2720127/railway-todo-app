import React from 'react';

const TextField = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      type="text"
      ref={ref}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
});

export default TextField;
