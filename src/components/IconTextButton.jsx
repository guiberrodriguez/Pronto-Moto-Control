import React from "react";

export default function IconTextButton({
  icon: Icon,
  label,
  onClick,
  className = "",
  type = "button"
}){
  return (
    <button
      type={type}
      className={`iconTextBtn ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon size={18}/>}
      <span>{label}</span>
    </button>
  );
}