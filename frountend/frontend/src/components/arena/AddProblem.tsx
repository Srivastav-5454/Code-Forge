import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUp, Pencil, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axiosInstance from "@/axiosInstance";

const AddProblem = () => {
  const [currentProblem, setCurrentProblem] = useState({
    title: "",
    statement: "",
    difficulty: "easy",
    constraints: "",
    testCases: [{ input: "", output: "" }],
  });

  const [editTestCaseIndex, setEditTestCaseIndex] = useState<number | null>(
    0
  );

  const [errors, setErrors] = useState({
    title: "",
    statement: "",
    constraints: "",
    testCases: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setCurrentProblem((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors({ ...errors, [field]: "" });
  };

  const handleTestCaseChange = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    const updatedTestCases = currentProblem.testCases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setCurrentProblem((prev) => ({ ...prev, testCases: updatedTestCases }));
    setErrors({ ...errors, testCases: "" });
  };

  const addTestCase = () => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }],
    }));
  };

  const handleEditTestCase = (index: number) => {
    setEditTestCaseIndex(index);
  };

  const saveTestCase = () => {
    setEditTestCaseIndex(null);
  };

  const handleDeleteTestCase = (index: number) => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
    if (editTestCaseIndex === index) setEditTestCaseIndex(null);
  };

  const saveProblem = async () => {
    try {
      const username = sessionStorage.getItem("username");
      const response = await axiosInstance.post("/problems", {
        title: currentProblem.title,
        difficulty: currentProblem.difficulty,
        problem_statement: currentProblem.statement,
        constraints: currentProblem.constraints,
        testcases: currentProblem.testCases.map((testCase) => ({
          input: testCase.input,
          output: testCase.output,
        })),
        owner: username,
      });

      if (response.status === 200) {
        
        console.log("Problem added successfully", response.data);
        window.location.reload();
      } else {
        
        console.error("Failed to add problem", response.data);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // Handle specific errors from the backend
        console.error("Error adding problem:", error.response.data);
      } else {
        // Handle general errors
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-[#FFAD60] hover:bg-[#FFA250] flex items-center">
          Add Problem
          <ArrowUp size={16} className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <ScrollArea className="h-[40rem] p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Problem</DialogTitle>
            <DialogDescription>
              Add a new problem to the list of available problems.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="problem-title" className="mb-1">
                Title
              </Label>
              <Input
                id="problem-title"
                placeholder="Problem Title"
                value={currentProblem.title}
                onChange={(e) => handleInputChange(e, "title")}
                className={`border ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 w-11/12 ml-1`}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="problem-statement" className="mb-1">
                Problem Statement
              </Label>
              <Textarea
                id="problem-statement"
                placeholder="Problem Statement"
                value={currentProblem.statement}
                onChange={(e) => handleInputChange(e, "statement")}
                className={`border ${errors.statement ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 w-11/12 ml-1`}
              />
              {errors.statement && <p className="text-red-500 text-sm">{errors.statement}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="problem-difficulty" className="mb-1">
                Difficulty Level
              </Label>
              <RadioGroup
                value={currentProblem.difficulty}
                onValueChange={(value) =>
                  setCurrentProblem((prev) => ({ ...prev, difficulty: value }))
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="easy"
                    id="option-easy"
                    className="w-4 h-4 border border-gray-800 rounded-full checked:bg-[#14b8a6] checked:border-[#14b8a6]"
                  />
                  <Label htmlFor="option-easy" className="text-[#14b8a6]">
                    Easy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="medium"
                    id="option-medium"
                    className="w-4 h-4 border border-gray-800 rounded-full checked:bg-[#f59e0b] checked:border-[#f59e0b]"
                  />
                  <Label htmlFor="option-medium" className="text-[#f59e0b]">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="hard"
                    id="option-hard"
                    className="w-4 h-4 border border-gray-800 rounded-full checked:bg-[#ef4444] checked:border-[#ef4444]"
                  />
                  <Label htmlFor="option-hard" className="text-[#ef4444]">
                    Hard
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1">
              <Label htmlFor="problem-constraints" className="mb-1">
                Constraints
              </Label>
              <Textarea
                id="problem-constraints"
                placeholder="Constraints"
                value={currentProblem.constraints}
                onChange={(e) => handleInputChange(e, "constraints")}
                className={`border ${errors.constraints ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 w-11/12 ml-1`}
              />
              {errors.constraints && <p className="text-red-500 text-sm">{errors.constraints}</p>}
            </div>
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Test Cases</h3>
              {currentProblem.testCases.map((testCase, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="space-y-1">
                    {editTestCaseIndex === index ? (
                      <>
                        <Label htmlFor={`test-input-${index}`}>Input</Label>
                        <Textarea
                          id={`test-input-${index}`}
                          placeholder="Test Case Input"
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          className={`border ${errors.testCases ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                        />
                        <Label htmlFor={`test-output-${index}`}>Output</Label>
                        <Textarea
                          id={`test-output-${index}`}
                          placeholder="Test Case Output"
                          value={testCase.output}
                          onChange={(e) =>
                            handleTestCaseChange(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          className={`border ${errors.testCases ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={saveTestCase}
                        >
                          Save Test Case
                        </Button>
                        {errors.testCases && <p className="text-red-500 text-sm">{errors.testCases}</p>}
                      </>
                    ) : (
                      <>
                        <pre>
                          <strong>Input:</strong>
                          {" \n"} {testCase.input}
                        </pre>
                        <pre>
                          <strong>Output:</strong>
                          {" \n"} {testCase.output}
                        </pre>
                        <div className="flex space-x-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTestCase(index)}
                          >
                            Edit
                            <Pencil size={16} className="ml-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            color="red"
                            onClick={() => handleDeleteTestCase(index)}
                          >
                            Delete
                            <Trash2 size={16} className="ml-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <Button size="sm" onClick={addTestCase}>
                Add Test Case
              </Button>
            </div>

              <Button
                onClick={saveProblem}
                className="mt-4 w-full bg-[#FFAD60] hover:bg-[#FFA250]"
              >
                Add Problem
              </Button>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddProblem;
