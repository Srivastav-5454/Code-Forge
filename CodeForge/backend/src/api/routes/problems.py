from fastapi import APIRouter, BackgroundTasks, Response
from pydantic import BaseModel

from api.models import Contests, Problems, Submissions, TestCases
from api.routes import Error, ProblemDetails, ProblemList, manager
from api.routes.run import RunRequest, RunResponse, run_code

router = APIRouter(prefix="/problems")

class SubmitResult(BaseModel):
    is_solved: bool
    total_passed: int
    elapsed_time: float
    memory_used: float
    results: list[RunResponse]


@router.post("/")
def add_problem(problem: ProblemDetails, response: Response) -> Problems | Error:
    new_problem = Problems(
        title=problem.title,
        difficulty=problem.difficulty,
        problem_statement=problem.problem_statement,
        constraints=problem.constraints,
        owner=problem.owner,
    )
    if not new_problem.add():
        response.status_code = 400
        return Error(
            "Cannot add problem",
            "Invalid title: Only use alphanumeric characters and spaces, or try a different title.",
        )
    try:
        new_problem.add_testcases(problem.testcases)
    except KeyError:
        response.status_code = 400
        return Error(
            "Cannot add testcases to problem",
            "Invalid testcases: Each testcase must have 'input' and 'output' keys.",
        )

    return new_problem


@router.get("/")
def get_all_problems(username: str) -> list[ProblemList]:
    problems = Problems.get_all(username)
    problems_info = []
    for problem, is_solved in problems:
        if is_solved is None:
            is_solved = False
        problems_info.append(
            ProblemList(
                code=problem.code,
                title=problem.title,
                difficulty=problem.difficulty,
                is_solved=is_solved,
            )
        )
    return problems_info


@router.get("/{problem_code}")
def get_problem(problem_code: str, response: Response) -> ProblemDetails | Error:
    problem = Problems.get(problem_code)
    if not problem:
        response.status_code = 404
        return Error("Problem not found", "Invalid problem code.")
    testcases = TestCases.get(problem.id)
    return ProblemDetails(
        title=problem.title,
        difficulty=problem.difficulty,
        problem_statement=problem.problem_statement,
        constraints=problem.constraints,
        testcases=[{"input": t.input, "output": t.output} for t in testcases],
        owner=problem.owner,
    )


@router.post("/{problem_code}/submit")
async def submit_problem(
    problem_code: str,
    run_req: RunRequest,
    response: Response,
    background_tasks: BackgroundTasks,
) -> SubmitResult | Error:
    if run_req.username is None:
        response.status_code = 403
        return Error(
            "Forbidden",
            "You can't submit the solution, please login.",
        )

    problem = Problems.get(problem_code)
    if not problem:
        response.status_code = 404
        return Error("Problem not found", "Invalid problem code.")

    testcases = TestCases.get(problem.id)
    all_results = []
    total_passed, total_elapsed_time, total_memory_used = 0, 0, 0
    for testcase in testcases:
        run_req.input_data = testcase.input
        result = run_code(run_req)
        if result.message == "Success":
            if result.stdout.strip("\n ") == testcase.output.strip("\n "):
                result.test_passed = True
                total_passed += 1
            total_elapsed_time += result.elapsed_time
            total_memory_used += result.memory_usage
        all_results.append(result)

    is_solved = total_passed == len(testcases)

    submission = Submissions.get(problem.id, run_req.username)
    if not submission:
        submission = Submissions(
            problem_id=problem.id,
            contest_id=problem.contest_id,
            username=run_req.username,
            is_solved=is_solved,
            total_passed=total_passed,
            elapsed_time=total_elapsed_time,
            memory_used=total_memory_used,
        )
    elif not is_solved and submission.total_passed < total_passed:
        submission.is_solved = is_solved
        submission.total_passed = total_passed
        submission.elapsed_time = total_elapsed_time
        submission.memory_used = total_memory_used
    elif is_solved and submission.elapsed_time > total_elapsed_time:
        submission.is_solved = is_solved
        submission.total_passed = total_passed
        submission.elapsed_time = total_elapsed_time
        submission.memory_used = total_memory_used
    submission.add()

    if problem.contest_id:
        contest_code = Contests.get_code(problem.contest_id)
        # Add the broadcast to the background tasks
        # background_tasks.add_task(manager.broadcast, problem.contest_id, "reload")
        print("Sending message")
        await manager.broadcast(contest_code, "reload")
        print("Message sent")

    return SubmitResult(
        is_solved=is_solved,
        total_passed=total_passed,
        elapsed_time=total_elapsed_time,
        memory_used=total_memory_used,
        results=all_results,
    )

