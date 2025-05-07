import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, CloudUpload } from "lucide-react";
import axiosInstance from "@/axiosInstance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

interface InputOutputProps {
  problem_id: string;
  code: string;
  language: string;
}

interface TestCase {
  id: string;
  inputText: string;
  outputText: string;
  runText?: string;
  elapsedTime?: number;
  memoryUsage?: number;
  message?: string;
}

interface Result {
  stdout: string;
  stderr: string;
  return_code: number;
  elapsed_time: number;
  memory_usage: number;
  timeout: boolean;
  test_passed: boolean;
  message: string;
}

interface SubmitResponse {
  is_solved: boolean;
  total_passed: number;
  elapsed_time: number;
  memory_used: number;
  results: Result[];
}

const InputOutput: React.FC<InputOutputProps> = ({
  problem_id,
  code,
  language,
}) => {
  const [subResponse, setSubResponse] = useState<SubmitResponse | null>(null);
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const [problem, setProblem] = useState<{ examples: TestCase[] }>({
    examples: [],
  });
  const [loading, setLoading] = useState(true);

  const [showRunSpinner, setShowRunSpinner] = useState<boolean>(false);
  const [showSubmitSpinner, setShowSubmitSpinner] = useState<boolean>(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosInstance.get(`/problems/${problem_id}`);
        const fetchedTestCases = response.data.testcases.map(
          (testcase: any, index: number) => ({
            id: String(index + 1),
            inputText: testcase.input,
            outputText: testcase.output,
          })
        );

        setProblem({
          examples: [
            ...fetchedTestCases,
            { id: "custom", inputText: "", outputText: "" },
          ],
        });
      } catch (error) {
        console.error("Error fetching test cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problem_id]);

  const handleInputChange = (id: string, newInput: string) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id ? { ...example, inputText: newInput } : example
      ),
    }));
  };

  const handleOutputChange = (id: string, newOutput: string) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id ? { ...example, outputText: newOutput } : example
      ),
    }));
  };

  const handleRunTextChange = (id: string, newRunText: string) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id ? { ...example, runText: newRunText } : example
      ),
    }));
  };

  const handleElapsedTimeChange = (id: string, newElapsedTime: number) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id
          ? { ...example, elapsedTime: newElapsedTime }
          : example
      ),
    }));
  };

  const handleMemoryUsageChange = (id: string, newMemoryUsage: number) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id
          ? { ...example, memoryUsage: newMemoryUsage }
          : example
      ),
    }));
  };

  const handleMessageChange = (id: string, newMessage: string) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.map((example) =>
        example.id === id ? { ...example, message: newMessage } : example
      ),
    }));
  };

  const mapLanguage = (language: string) => {
    switch (language) {
      case "JavaScript":
        return "js";
      case "Python":
        return "py";
      case "C":
        return "c";
      case "C++":
        return "cpp";
      default:
        return "py"; // default to Python if something goes wrong
    }
  };

  const handleRun = async () => {
    const runningTestCaseId =
      activeTestCaseId === problem.examples.length - 1
        ? "custom"
        : String(activeTestCaseId + 1);
    const customInput = problem.examples[activeTestCaseId].inputText;
    var runText = "";
    var elapsedTime = 0;
    var memoryUsage = 0;
    var message = "";

    setShowRunSpinner(true);

    try {
      const mappedLanguage = mapLanguage(language);
      const response = await axiosInstance.post("/run", {
        source_code: code,
        input_data: customInput,
        language: mappedLanguage,
        username: sessionStorage.getItem("username"),
      });
      runText = response.data.stdout + response.data.stderr || "No output";
      elapsedTime = response.data.elapsed_time;
      memoryUsage = response.data.memory_usage;
      message = response.data.message;
    } catch (error) {
      console.error("Error running code:", error);
      runText = "An error occurred"; // Handle error cases
    }
    setSubResponse(null);
    handleRunTextChange(runningTestCaseId, runText);
    handleElapsedTimeChange(runningTestCaseId, elapsedTime);
    handleMemoryUsageChange(runningTestCaseId, memoryUsage);
    handleMessageChange(runningTestCaseId, message);
    setShowRunSpinner(false);
  };

  const handleSubmit = async () => {
    setShowSubmitSpinner(true);

    try {
      const response = await axiosInstance.post(
        `/problems/${problem_id}/submit`,
        {
          source_code: code,
          language: mapLanguage(language),
          username: sessionStorage.getItem("username"),
        }
      );
      setSubResponse(response.data);
      for (let i = 0; i < problem.examples.length - 1; i++) {
        const runText =
          response.data?.results[i]?.stdout +
            response.data?.results[i]?.stderr || "No output";

        const elapsedTime = response.data?.results[i]?.elapsed_time ?? "N/A";
        const memoryUsage = response.data?.results[i]?.memory_usage ?? "N/A";
        const message = response.data?.results[i]?.message ?? "N/A";

        handleRunTextChange(String(i + 1), runText);
        handleElapsedTimeChange(String(i + 1), elapsedTime);
        handleMemoryUsageChange(String(i + 1), memoryUsage);
        handleMessageChange(String(i + 1), message);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
    }
    setShowSubmitSpinner(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full overflow-auto bg-[#18181b] h-full overflow-hidden">
      <div className="flex py-7 px-5 h-10 items-center justify-between space-x-6 bg-[#2d2d2d]">
        <div className="text-md font-medium leading-5 text-white">
          Testcases
        </div>
        <div className="flex gap-1">
          <Button
            className="bg-[#423F3E] text-white px-4 py-2 rounded hover:bg-[#555555]"
            size="sm"
            onClick={handleRun}
          >
            {showRunSpinner ? (
              <Spinner size="small" className="mr-2" />
            ) : (
              <Play size={16} className="mr-2" />
            )}
            Run
          </Button>
          <Button
            className="bg-[#423F3E] text-green-500 px-4 py-2 rounded hover:bg-[#555555]"
            size="sm"
            onClick={handleSubmit}
          >
            {showSubmitSpinner ? (
              <Spinner size="small" className="mr-2 text-green-500" />
            ) : (
              <CloudUpload size={16} className="mr-2" />
            )}
            Submit
          </Button>
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="h-screen">
          {subResponse && subResponse.is_solved ? (
            <div className="flex items-start justify-between p-4">
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-green-500">
                  All test cases passed!
                </p>
                <p className="text-sm text-[#ffffff99]">
                  Total test cases passed: {subResponse.total_passed} /{" "}
                  {problem.examples.length - 1}
                </p>
              </div>
              <div className="flex flex-col mr-10">
                <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                  <p className="text-white">Execution Time:</p>
                  <p>
                    {subResponse ? `${subResponse.elapsed_time} sec` : "N/A"}
                  </p>
                </div>
                <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                  <p className="text-white">Memory Usage:</p>
                  <p>{subResponse ? `${subResponse.memory_used} MB` : "N/A"}</p>
                </div>
              </div>
            </div>
          ) : subResponse && !subResponse.is_solved ? (
            <div className="flex items-start justify-between p-4">
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-red-500">
                  Some test cases failed!
                </p>
                <p className="text-sm text-[#ffffff99]">
                  Total test cases passed: {subResponse.total_passed} /{" "}
                  {problem.examples.length - 1}
                </p>
              </div>
              <div className="flex flex-col mr-10">
                <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                  <p className="text-white">Execution Time:</p>
                  <p>
                    {subResponse ? `${subResponse.elapsed_time} sec` : "N/A"}
                  </p>
                </div>
                <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                  <p className="text-white">Memory Usage:</p>
                  <p>{subResponse ? `${subResponse.memory_used} MB` : "N/A"}</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex mt-4 px-4">
            {problem.examples
              .filter((example) => example.id !== "custom")
              .map((example, index) => (
                <div className="mr-2 mt-2 cursor-pointer" key={example.id}>
                  <div className="flex items-center gap-y-4">
                    <div
                      className={`text-sm font-medium inline-flex items-center transition-all duration-300 rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap ${
                        activeTestCaseId === index
                          ? "bg-[#27272a] text-white"
                          : "bg-[#2d2d2d] text-gray-500"
                      }`}
                      onClick={() => setActiveTestCaseId(index)}
                    >
                      {subResponse ? (
                        subResponse.results[index]?.test_passed ? (
                          <span className="w-1 h-1 mr-2 bg-green-500 rounded-full inline-block"></span>
                        ) : (
                          <span className="w-1 h-1 mr-2 bg-red-500 rounded-full inline-block"></span>
                        )
                      ) : null}
                      Case {index + 1}
                    </div>
                  </div>
                </div>
              ))}

            <div className="mr-2 mt-2 cursor-pointer">
              <div className="flex items-center gap-y-4">
                <div
                  className={`text-sm font-medium inline-flex items-center transition-all duration-300 rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap ${
                    activeTestCaseId === problem.examples.length - 1
                      ? "bg-[#27272a] text-white"
                      : "bg-[#2d2d2d] text-gray-500"
                  }`}
                  onClick={() =>
                    setActiveTestCaseId(problem.examples.length - 1)
                  }
                >
                  Custom Input
                </div>
              </div>
            </div>
          </div>

          {problem.examples.map((example, index) =>
            activeTestCaseId === index ? (
              <div key={example.id} className="font-semibold my-4 px-4">
                {/* do only if example.message is not undefined */}
                {example.id !== "custom" && example.message === "Success" ? (
                  example.runText?.trim() === example.outputText.trim() ? (
                    <p className="text-lg font-semibold text-green-500">
                      Test case passed!
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-red-500">
                      Test case failed!
                    </p>
                  )
                ) : example.id !== "custom" && example.message ? (
                  <p className="text-lg font-semibold text-red-500">
                    Test case failed! : {example.message}
                  </p>
                ) : null}

                {example.elapsedTime !== undefined &&
                  example.memoryUsage !== undefined && (
                    <div className="flex flex-col">
                      <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                        <p className="text-white">Execution Time:</p>
                        <p>
                          {example.elapsedTime !== undefined
                            ? `${example.elapsedTime} sec`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-row text-sm text-[#ffffff99] gap-1">
                        <p className="text-white">Memory Usage:</p>
                        <p>
                          {example.memoryUsage !== undefined
                            ? `${example.memoryUsage} MB`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                <p className="text-sm font-medium mt-4 text-gray-500">Input:</p>
                <textarea
                  className="w-full rounded-lg text-sm font-light border px-3 py-2 bg-[#27272a] border-transparent text-white mt-2"
                  value={example.inputText}
                  onChange={(e) =>
                    handleInputChange(example.id, e.target.value)
                  }
                  disabled={example.id !== "custom"}
                />
                {example.id !== "custom" && (
                  <>
                    <p className="text-sm font-medium mt-4 text-gray-500">
                      Expected:
                    </p>
                    <textarea
                      className="w-full rounded-lg text-sm font-light border px-3 py-2 bg-[#27272a] border-transparent text-white mt-2"
                      value={example.outputText}
                      onChange={(e) =>
                        handleOutputChange(example.id, e.target.value)
                      }
                      disabled
                    />
                  </>
                )}
                <p className="text-sm font-medium mt-4 text-gray-500">
                  Run Output:
                </p>
                <textarea
                  className="w-full h-fit rounded-lg text-sm font-light border px-3 py-2 bg-[#27272a] border-transparent text-white mt-2"
                  value={example.runText || ""}
                  onChange={(e) =>
                    handleRunTextChange(example.id, e.target.value)
                  }
                  readOnly
                />
              </div>
            ) : null
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InputOutput;
