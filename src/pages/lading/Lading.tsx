import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Lading = () => {
  const navigate = useNavigate();

  const [url, setUrl] = useState("SuluaS192SLm7iAxHf4QX3");

  useEffect(() => {
    const user = localStorage.getItem("token");

    if (!user) {
      navigate("/login");
    }
  }, []);
  return (
    <div>
      <input type="text" value={url} />
      <button
        onClick={() => {
          navigate(`/${url}`);
        }}
      >
        Click
      </button>
    </div>
  );
};

export default Lading;
