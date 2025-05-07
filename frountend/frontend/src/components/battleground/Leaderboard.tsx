import React, { useEffect, useState } from "react";
import axiosInstance from "@/axiosInstance";
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

// Define the type for leaderboard entries
interface LeaderboardEntry {
  username: string;
  solved_problems: number;
  total_time: string;
}

interface LeaderboardProps {
  contest_code: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ contest_code }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axiosInstance.get(`/contests/${contest_code}/leaderboard`);
        console.log(response.data);
        setLeaderboard(response.data);
      } catch (err) {
        setError("Failed to fetch leaderboard.");
      }
    };

    fetchLeaderboard();
  }, [contest_code]);

  useEffect(() => {
    console.log("Connecting to websocket");
    const ws = new WebSocket(`ws://localhost:8000/contests/ws/${contest_code}`);

    ws.onmessage = (event) => {
      if (event.data === "reload") {
        const fetchLeaderboard = async () => {
          try {
            const response = await axiosInstance.get(`/contests/${contest_code}/leaderboard`);
            console.log(response.data);
            setLeaderboard(response.data);
          } catch (err) {
            setError("Failed to fetch leaderboard.");
          }
        };

        fetchLeaderboard();
      }
    };

    return () => {
      ws.close();
    };
  }, [contest_code]);

  return (
    <Card className="w-[40rem]">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          The top performers in the contest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Rank</TableHead>
                <TableHead className="text-center">Username</TableHead>
                <TableHead className="text-center">Solved</TableHead>
                <TableHead className="text-right">Time Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="text-left">{index + 1}</TableCell>
                  <TableCell className="text-center">{entry.username}</TableCell>
                  <TableCell className="text-center">{entry.solved_problems}</TableCell>
                  <TableCell className="text-right">{entry.total_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
