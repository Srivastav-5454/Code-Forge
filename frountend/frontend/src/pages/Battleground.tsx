import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContestCard from "@/components/ContestCard";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import axiosInstance from "@/axiosInstance";

// const contests = [
//   {
//     title: "Hackathon 2024",
//     details: "Join us for a thrilling hackathon with exciting challenges.",
//     date: "2024-08-15",
//     owner: "Tech Innovators Inc.",
//     id: "hackathon-2024",
//   },
//   {
//     title: "Code Sprint",
//     details: "A fast-paced coding sprint with algorithmic challenges.",
//     date: "2024-09-10",
//     owner: "Code Masters",
//     id: "code-sprint",
//   },
//   {
//     title: "AI Challenge",
//     details: "Compete in AI challenges and showcase your skills.",
//     date: "2024-10-05",
//     owner: "AI Enthusiasts",
//     id: "ai-challenge",
//   },
// ];

export default function MainPage() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (!storedUserName) {
      navigate("/");
    }
    try {
      axiosInstance.get("/contests/").then((response) => {
        console.log(response.data);
        setContests(response.data);
      });
    } catch (error) {
      console.error("Error fetching contests", error);
    }
  }, [navigate]);

  const handleAddContest = () => {
    navigate("/add-contest");
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="flex justify-between w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold">Coding Contests</h1>
        <Button
          className="bg-[#FFAD60] hover:bg-[#FFA250] flex items-center"
          onClick={handleAddContest}
        >
          Add Contest
          <ArrowUp size={16} className="ml-2" />
        </Button>
      </div>
      <div className="flex flex-col gap-8 w-full max-w-3xl">
        {contests.map((contest, index) => (
          <ContestCard
            key={index}
            title={contest.title}
            details={contest.details}
            date={contest.date}
            owner={contest.owner}
            route={`/battleground/${contest.code}`}
          />
        ))}
      </div>
    </div>
  );
}
