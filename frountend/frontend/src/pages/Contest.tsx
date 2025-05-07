import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Problems from "@/components/arena/Problems";
import Leaderboard from "@/components/battleground/Leaderboard";
import { useParams } from "react-router-dom";
// import axiosInstance from "@/axiosInstance";

const convertToTitleCase = (str: string) => {
  const words = str.split("-");

  const titleCase = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return titleCase;
};

const Contest: React.FC = () => {
  const navigate = useNavigate();
  // get the contest id from the URL
  const { contest_code } = useParams<{ contest_code: string }>();

  console.log(contest_code);

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (!storedUserName) {
      navigate("/");
    }
  }, [navigate, contest_code]);



  return (
    <div className="p-4 flex flex-col overflow-hidden">
      <p className="text-3xl ml-6 font-medium self-center mb-5">
        {convertToTitleCase(contest_code)}
      </p>
      <div className="flex justify-between w-screen">
        <div className="w-1/2 pr-2">
          <Problems type="contest" contest_code={contest_code} />
        </div>
        <div className="w-1/2 pl-2 mt-5">
          <Leaderboard contest_code={contest_code} />
        </div>
      </div>
    </div>
  );
};

export default Contest;
