import React from "react";

const Button = ({ text, disabled, icon, className, onClick }) => {
  return (
    <button
      className={`button ${className} ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      {icon && <span className='button-icon'>{icon}</span>}
      {<span className='label'>{text}</span>}
    </button>
  );
};

export default Button;
