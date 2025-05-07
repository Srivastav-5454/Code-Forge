import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import { ArrowUp } from "lucide-react";
import axiosInstance from "@/axiosInstance";

export default function AddContestPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (!storedUserName) {
      navigate("/");
    }
  }, [navigate]);

  const [contestDetails, setContestDetails] = useState({
    contestTitle: "",
    details: "",
  });
  const [problems, setProblems] = useState([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentProblem, setCurrentProblem] = useState({
    title: "",
    statement: "",
    difficulty: "easy",
    constraints: "",
    testcases: [{ input: "", output: "" }],
  });
  const [isEditingDetails, setIsEditingDetails] = useState(true);
  const [editTestCaseIndex, setEditTestCaseIndex] = useState<number | null>(
    0
  );
  const [errors, setErrors] = useState({
    contestTitle: "",
    details: "",
    title: "",
    statement: "",
    constraints: "",
    testCases: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setCurrentProblem({ ...currentProblem, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleContestDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setContestDetails({ ...contestDetails, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  }

  const handleDifficultyChange = (value: string) => {
    setCurrentProblem({ ...currentProblem, difficulty: value });
  };

  const handleTestCaseChange = (
    index: number,
    field: string,
    value: string
  ) => {
    console.log(index, field, value);
    const newTestcases = [...currentProblem.testcases];
    newTestcases[index][field] = value;
    setCurrentProblem({ ...currentProblem, testcases: newTestcases });
    setErrors({ ...errors, testCases: "" });
  };

  const saveProblem = () => {

  
    if (editIndex !== null) {
      const newProblems = [...problems];
      newProblems[editIndex] = currentProblem;
      setProblems(newProblems);
      setEditIndex(null);
    } else {
      setProblems([...problems, currentProblem]);
    }
    setCurrentProblem({
      title: "",
      statement: "",
      difficulty: "Easy",
      constraints: "",
      testcases: [{ input: "", output: "" }],
    });
  };

  const addTestCase = () => {
    setCurrentProblem({
      ...currentProblem,
      testcases: [...currentProblem.testcases, { input: "", output: "" }],
    });
  };

  const handleEditProblem = (index: number) => {
    setEditIndex(index);
    setCurrentProblem(problems[index]);
  };

  const saveContestDetails = () => {
    setIsEditingDetails(false);
  };

  const editContestDetails = () => {
    setIsEditingDetails(true);
  };

  const handleDeleteProblem = (index: number) => {
    const newProblems = problems.filter((_, i) => i !== index);
    setProblems(newProblems);
  };

  const handleEditTestCase = (index: number) => {
    setEditTestCaseIndex(index);
  };

  const saveTestCase = () => {
    setEditTestCaseIndex(null);
  };

  const handleDeleteTestCase = (index: number) => {
    const newTestcases = currentProblem.testcases.filter((_, i) => i !== index);
    setCurrentProblem({ ...currentProblem, testcases: newTestcases });
  };

  const submitNewContest = async () => {

    try {
      const contestResponse = await axiosInstance.post("/contests", {
        title: contestDetails.contestTitle,
        details: contestDetails.details,
        owner: sessionStorage.getItem("username"),
      });

      const contestData = contestResponse.data;

      if (contestData && contestData.code) {
        const contestCode = contestData.code;

        const formattedProblems = problems.map((problem) => ({
          title: problem.title,
          problem_statement: problem.statement, // Adjust key names if needed
          difficulty: problem.difficulty,
          constraints: problem.constraints,
          owner: sessionStorage.getItem("username"),
          testcases: problem.testcases, // Ensure this matches backend expectations
        }));

        // Send problems to backend
        try {
          await axiosInstance.post(
            `/contests/${contestCode}/problems`,
            formattedProblems
          );
          alert("Contest and problems added successfully!");
          navigate("/battleground");
        } catch (problemError) {
          if (problemError.response && problemError.response.data) {
            alert(
              `Error: ${
                problemError.response.data.message || "Failed to add problems."
              }`
            );
          } else {
            alert("An unexpected error occurred. Please try again.");
          }
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(
          `Error: ${error.response.data.message || "Failed to add contest."}`
        );
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Add New Contest</h1>
      <Tabs defaultValue="details" className="w-[800px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Contest Details</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Contest Details</CardTitle>
              <CardDescription>
                Provide details about the contest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-auto">
              {isEditingDetails ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Contest Title"
                      value={contestDetails.contestTitle}
                      onChange={(e) => handleContestDetailsChange(e, "contestTitle")}
                      className={`border ${errors.contestTitle ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                    />
                    {errors.contestTitle && (
                      <p className="text-red-500 text-sm">{errors.contestTitle}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      placeholder="Contest Details"
                      value={contestDetails.details}
                      onChange={(e) => handleContestDetailsChange(e, "details")
                      }
                      className={`border ${errors.details ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                    />
                    {errors.details && (
                      <p className="text-red-500 text-sm">{errors.details}</p>
                    )}
                  </div>
                  <CardFooter>
                    <Button onClick={saveContestDetails} className="w-full">
                      Save Contest Details
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p>
                      <strong>Title:</strong> {contestDetails.contestTitle}
                    </p>
                    <p>
                      <strong>Details:</strong> {contestDetails.details}
                    </p>
                  </div>
                  <CardFooter>
                    <Button onClick={editContestDetails} className="w-full">
                      Edit
                    </Button>
                  </CardFooter>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="problems">
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
              <CardDescription>
                Add the problems for this contest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[900px] overflow-auto">
              {problems.map((problem, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h2 className="font-semibold mb-2">
                    Problem {index + 1}
                    <div className="flex space-x-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProblem(index)}
                      >
                        Edit
                        <Pencil size={16} className="ml-2" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        color="red"
                        onClick={() => handleDeleteProblem(index)}
                      >
                        Delete
                        <Trash2 size={16} className="ml-2" />
                      </Button>
                    </div>
                  </h2>
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap text-sm">
                      <strong>Title:</strong> {problem.title}
                    </p>
                    <pre className="whitespace-pre-wrap text-sm">
                      <strong className="">Statement:</strong>{" "}
                      {problem.statement}
                    </pre>
                    <p className="whitespace-pre-wrap text-sm">
                      <strong>Difficulty Level:</strong> {problem.difficulty}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">
                      <strong>Constraints:</strong>
                      {" \n"} {problem.constraints}
                    </p>
                    <h3 className="font-semibold mt-2 text-sm">Test Cases</h3>
                    {problem.testcases.map((testCase, testCaseIndex) => (
                      <div
                        key={testCaseIndex}
                        className="p-2 border rounded-lg mt-2"
                      >
                        <div className="space-y-1">
                          <pre className="whitespace-pre-wrap text-sm">
                            <strong>Input:</strong> {" \n"}
                            {testCase.input}
                          </pre>
                          <pre className="whitespace-pre-wrap text-sm">
                            <strong>Output:</strong> {" \n"}
                            {testCase.output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-4 border rounded-lg">
                <h2 className="font-semibold mb-2">
                  {editIndex !== null ? "Edit Problem" : "Add Problem"}
                </h2>
                <div className="space-y-1 m-2">
                  <Label htmlFor="problem-title">Title</Label>
                  <Input
                    id="problem-title"
                    placeholder="Problem Title"
                    value={currentProblem.title}
                    onChange={(e) => handleInputChange(e, "title")}
                    className={`border ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>
                <div className="space-y-1 m-2">
                  <Label htmlFor="problem-statement">Problem Statement</Label>
                  <Textarea
                    id="problem-statement"
                    placeholder="Problem Statement"
                    value={currentProblem.statement}
                    onChange={(e) => handleInputChange(e, "statement")}
                    className={`border ${errors.statement ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                  />
                  {errors.statement && (
                    <p className="text-red-500 text-sm">{errors.statement}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="problem-difficulty" className="mb-1">
                    Difficulty Level
                  </Label>
                  <RadioGroup
                    value={currentProblem.difficulty}
                    onValueChange={handleDifficultyChange}
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
                <div className="space-y-1 m-2">
                  <Label htmlFor="problem-constraints">Constraints</Label>
                  <Textarea
                    id="problem-constraints"
                    placeholder="Problem Constraints"
                    value={currentProblem.constraints}
                    onChange={(e) => handleInputChange(e, "constraints")}
                    className={`border ${errors.constraints ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                  />
                  {errors.constraints && (
                    <p className="text-red-500 text-sm">{errors.constraints}</p>
                  )}
                </div>
                <div className="space-y-4 mt-2">
                  <h3 className="font-semibold">Test Cases</h3>
                  {currentProblem.testcases.map((testCase, index) => (
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
                                handleTestCaseChange(
                                  index,
                                  "input",
                                  e.target.value
                                )
                              }
                              className={`border ${errors.testCases ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                            />
                            <Label htmlFor={`test-output-${index}`}>
                              Output
                            </Label>
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
                            {errors.testCases && (
                              <p className="text-red-500 text-sm">{errors.testCases}</p>
                            )}
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
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProblem} className="w-full">
                {editIndex !== null ? "Update Problem" : "Add Problem"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Button
        className="bg-[#FFAD60] hover:bg-[#FFA250] flex items-center m-4"
        onClick={submitNewContest}
      >
        Post Contest
        <ArrowUp size={16} className="ml-2" />
      </Button>
    </div>
  );
}
