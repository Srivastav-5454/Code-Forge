import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import axiosInstance from "@/axiosInstance";

interface ProblemDescriptionProps {
  problem_id: string;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem_id,
}) => {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosInstance.get(`/problems/${problem_id}`);
        setProblem(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problem_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!problem) {
    return <div>Problem not found</div>;
  }

  return (
    <ScrollArea className="">
      <div className="bg-muted/50 p-5 w-full h-screen">
        <div className="flex items-center gap-2 text-xl mb-4">
          <p className="font-semibold">{problem.title}</p>
          {problem.difficulty === "easy" ? (
            <Badge
              variant="secondary"
              className="text-xs font-light text-[#14b8a6]"
            >
              {problem.difficulty}
            </Badge>
          ) : problem.difficulty === "medium" ? (
            <Badge
              variant="secondary"
              className="text-xs font-light text-[#f1c40f]"
            >
              {problem.difficulty}
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs font-light text-[#e74c3c]"
            >
              {problem.difficulty}
            </Badge>
          )}
        </div>
        <pre className="whitespace-pre-wrap mt-2 text-sm">
          {problem.problem_statement}
        </pre>
        <div className="mt-4 text-sm">
          {problem.testcases.map((example: any, index: number) => (
            <div key={index} className="mb-4">
              <p className="font-bold text-md mb-1">Example {index + 1}:</p>
              <div className="mb-2 ml-5 text-sm">
                <p className="font-semibold">Input:</p>
                <pre className="text-[#ffffff99]">{example.input}</pre>
              </div>
              <div className="ml-5 text-sm">
                <p className="font-semibold">Output:</p>
                <pre className="text-[#ffffff99]">{example.output}</pre>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm flex flex-col">
          <p className="font-bold text-md">Constraints:</p>
          
            <pre
              className="text-[#ffffff99] text-sm font-light w-fit my-1 ml-5"
            >
              {problem.constraints}
            </pre>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ProblemDescription;
