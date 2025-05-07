import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight, ArrowRight } from "lucide-react";
import classNames from "classnames";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NavigationCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  details?: string[];
  route: string;
}

export default function NavigationCard({
  className,
  title,
  details = [],
  route,
  color,
}: NavigationCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(route);
  };

  return (
    <Card
      className={cn(
        "navigation-card w-[300px] h-[347px] transition-transform duration-300",
        className
      )}
    >
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          {details.length > 0 ? (
            details.map((detail, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-3 last:mb-0 last:pb-0"
              >
                <ArrowRight className="w-4 h-4" />
                <div className="space-y-1">
                  <p
                    className="text-md font-medium leading-none"
                    // style={{ color }}
                  >
                    {detail}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center">No details available</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={classNames("w-full text-md", {
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
