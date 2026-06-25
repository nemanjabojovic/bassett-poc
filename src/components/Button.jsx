import React from "react";

const Button = ({ text, disabled, icon, className, onClick, style }) => {
  return (
    <button
      className={`button ${className} ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
      style={style}
    >
      {icon && <span className='button-icon'>{icon}</span>}
      {<span className='label'>{text}</span>}
    </button>
  );
};

export default Button;
