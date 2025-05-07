import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Problems from "../components/arena/Problems";

const Arena: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (!storedUserName) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <div className="flex justify-center">
      <Problems type="arena" />
    </div>
  );
};

export default Arena;
