import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import CodeEditor from "@/components/editor/CodeEditor";
import ProblemDescription from "@/components/problem/ProblemDescription";
import InputOutput from "@/components/problem/InputOutput";

const ProblemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { problem_id, contest_code } = useParams<{
    problem_id: string;
    contest_code: string;
  }>();

  console.log("problem_id:", problem_id);
  console.log("contest_code:", contest_code);

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (!storedUserName) {
      navigate("/");
    }
  }, [navigate]);

  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");

  return (
    <ResizablePanelGroup direction="horizontal" className="gap-[1.5px]">
      <ResizablePanel
        defaultSize={50}
        className="rounded-[7px] border-[2px] border-[#555555]"
      >
        <ProblemDescription problem_id={problem_id} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical" className="gap-[1.5px]">
          <ResizablePanel
            defaultSize={50}
            className="rounded-[7px] border-[2px] border-[#555555]"
          >
            <CodeEditor
              onLanguageChange={setLanguage}
              onCodeChange={setCode}
              problemId={problem_id}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={50}
            className="rounded-[7px] border-[2px] border-[#555555]"
          >
            <InputOutput
              problem_id={problem_id}
              code={code}
              language={language}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ProblemDetail;
