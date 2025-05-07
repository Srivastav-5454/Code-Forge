import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import classNames from "classnames";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface ContestCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  details: string;
  date: string;
  owner: string;
  route: string;
  color?: string; // Optional color for button
}

export default function ContestCard({
  className,
  title,
  details,
  date,
  owner,
  route,
  color = "#FFAD60",
}: ContestCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(route);
  };

  return (
    <Card
      className={cn(
        "contest-card flex w-full h-[150px] transition-transform duration-300",
        className
      )}
    >
      <CardContent className="flex flex-col justify-center p-4 w-2/3">
        <CardTitle className="text-left text-xl font-semibold mb-2">
          {title}
        </CardTitle>
        <div className="text-left text-md mb-2">{details}</div>
        <div className="text-left text-sm text-gray-500">
          <p>Date: {date}</p>
          <p>Owner: {owner}</p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end p-4 w-1/3">
        <Button
          className={classNames("text-md", {
            "text-black": color === "#FFAD60",
            "text-white": color !== "#FFAD60",
          })}
          style={{ backgroundColor: color }}
          onClick={handleNavigate}
        >
          Enter
          <MoveRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
