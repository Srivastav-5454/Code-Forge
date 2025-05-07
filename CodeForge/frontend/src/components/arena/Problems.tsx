import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import axiosInstance from "@/axiosInstance";

import AddProblem from "./AddProblem";

interface Problem {
  code: string;
  title: string;
  difficulty: string;
  is_solved: boolean;
}

interface ProblemsProps {
  type: string;
  contest_code?: string;
}

const Problems: React.FC<ProblemsProps> = ({ type, contest_code }) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        if (type.toLowerCase() === "arena") {
          const username = sessionStorage.getItem("username");
          const response = await axiosInstance.get(
            `/problems?username=${username}`
          );
          setProblems(response.data);
        } else if (type.toLowerCase() === "contest") {
          const username = sessionStorage.getItem("username");
          const response = await axiosInstance.get(
            `/contests/${contest_code}/problems?username=${username}`
          );
          setProblems(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };

    fetchProblems();
  }, [type, contest_code]);
  // }, []);

  return (
    <Card className="w-[40rem] m-5">
      <CardHeader className="px-7 flex flex-row justify-between items-start">
        <div>
          <CardTitle>Problem Statements</CardTitle>
          <CardDescription>
            A list of currently available problems.
          </CardDescription>
        </div>
        {type === "arena" && <AddProblem />}
      </CardHeader>
      <CardContent>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Title</TableHead>
              <TableHead className="text-center">Difficulty</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.map((problem) => (
              <TableRow key={problem.code} className="">
                <TableCell className="text-left cursor-pointer">
                  {type.toLowerCase() === "arena" ? (
                    <Link to={`/arena/${problem.code}`}>{problem.title}</Link>
                  ) : (
                    <Link to={`/battleground/${contest_code}/${problem.code}`}>
                      {problem.title}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {problem.difficulty.toLowerCase() === "easy" ? (
                    <Badge
                      variant="secondary"
                      className="text-xs font-light text-[#14b8a6]"
                    >
                      {problem.difficulty}
                    </Badge>
                  ) : problem.difficulty.toLowerCase() === "medium" ? (
                    <Badge
                      variant="secondary"
                      className="text-xs font-light text-[#f59e0b]"
                    >
                      {problem.difficulty}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-xs font-light text-[#ef4444]"
                    >
                      {problem.difficulty}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {problem.is_solved ? "Solved" : "Not solved"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Problems;
