import React from "react";

const Button = ({ saveContent }) => {
  return (
    <button onClick={saveContent} className="save-button">
      Save
    </button>
  );
};

export default Button;
