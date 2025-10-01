import React from "react";

const Toast = ({ message, type }) => {
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow bg-white ${type}`}>
      {message}
    </div>
  );
};

export default Toast;
