import axios from "axios";
import React, { useState, useEffect } from "react";
import NavigationCard from "@/components/NavigationCard"; // Adjust import path as necessary
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/axiosInstance";

// Define the card data
const cardData = [
  {
    title: "Playground",
    details: [
      "Write and execute code",
      "See performance metrics",
      "Test with custom inputs",
      "View code output",
      "Debug with error messages",
    ],
    route: "/playground",
    color: "#FFAD60",
  },
  {
    title: "Arena",
    details: [
      "Solve coding problems",
      "Upload your own problems",
      "Practice coding skills",
      "Define problem constraints",
      "Add test cases",
    ],
    route: "/arena",
    color: "#FB6D48",
  },
  {
    title: "Battleground",
    details: [
      "Participate in contests",
      "View real-time leaderboards",
      "Host your own contests",
      "Challenge other users",
      "Compete in various modes",
    ],
    route: "/battleground",
    color: "#4A249D",
  },
];

interface HomeProps {
  userName: string | null;
  setUserName: (username: string) => void;
}

const Home: React.FC<HomeProps> = ({ userName, setUserName }) => {
  const [tempUserName, setTempUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const handleSubmit = async () => {
    if (tempUserName.trim() === "") {
      return;
    }

    try {
      // Send POST request to create the user
      console.log("Creating user with username:", tempUserName);
      const response = await axiosInstance.post("/user", {
        username: tempUserName,
      });
      console.log(response);
      if (response.status === 200) {
        setUserName(tempUserName);
        sessionStorage.setItem("username", tempUserName);
        setTempUserName("");
      } else {
        setErrorMessage("Failed to create user");
      }
    } catch (error) {
      console.error("There was an error creating the user:", error);
      setErrorMessage("There was an error creating the user");
    }
  };

  return (
    <div className="card-container">
      {cardData.map((card, index) => (
        <NavigationCard
          key={index}
          title={card.title}
          details={card.details}
          route={card.route}
          color={card.color}
        />
      ))}

      {userName === "" && (
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogDescription>
                Please provide a username to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row items-center gap-2 mt-2">
              <Input
                type="text"
                id="username"
                placeholder="Username"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                className="grow"
              />
              <Button
                onClick={handleSubmit}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Submit
              </Button>
            </div>
            {errorMessage && (
              <div className="text-red-500 mt-2">{errorMessage}</div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Home;
