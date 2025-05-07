from fastapi import APIRouter, Response, WebSocket, WebSocketDisconnect, BackgroundTasks
from pydantic import BaseModel

from api.models import Contests, Problems
from api.routes import Error, ProblemDetails, ProblemList, manager

router = APIRouter(prefix="/contests")


class ContestPost(BaseModel):
    title: str
    details: str
    owner: str


@router.get("/")
def get_all_contests() -> list[Contests]:
    return Contests.get_all()


@router.post("/")
def add_contest(contest: ContestPost, response: Response) -> Contests | Error:
    new_contest = Contests(
        title=contest.title,
        details=contest.details,
        owner=contest.owner,
    )
    if not new_contest.add():
        response.status_code = 400
        return Error(
            "Cannot add contest",
            "Invalid title: Only use alphanumeric characters and spaces, or try a different title.",
        )
    return new_contest


@router.get("/{contest_code}")
def get_contest(contest_code: str, response: Response) -> Contests | Error:
    contest = Contests.get(contest_code)
    if not contest:
        response.status_code = 404
        return Error("Contest not found", "Invalid contest code.")
    return contest


@router.post("/{contest_code}/problems")
def add_contest_problem(
    contest_code: str, problems: list[ProblemDetails], response: Response
):
    contest = Contests.get(contest_code)
    if not contest:
        response.status_code = 404
        return Error("Contest not found", "Invalid contest code.")

    all_new_problems = []
    for problem in problems:
        if contest.owner != problem.owner:
            response.status_code = 403
            return Error(
                "Forbidden",
                "You do not have permission to add problems to this contest.",
            )
        new_problem = Problems(
            title=problem.title,
            difficulty=problem.difficulty,
            problem_statement=problem.problem_statement,
            constraints=problem.constraints,
            owner=problem.owner,
            contest_id=contest.id,
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
        all_new_problems.append(new_problem)

    return all_new_problems


@router.get("/{contest_code}/problems")
def get_contest_problems(contest_code: str, username: str, response: Response):
    contest = Contests.get(contest_code)
    print("Contest :", contest)
    if not contest:
        response.status_code = 404
        return Error("Contest not found", "Invalid contest code.")
    problems = contest.get_problems(username)
    if not problems:
        return []
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


@router.get("/{contest_code}/leaderboard")
def get_contest_leaderboard(contest_code: str, response: Response) -> list[dict] | Error:
    contest = Contests.get(contest_code)
    if not contest:
        response.status_code = 404
        return Error("Contest not found", "Invalid contest code.")
    
    leaderboard = Contests.get_leaderboard(contest.id)
    if not leaderboard:
        # response.status_code = 404
        # return Error("Leaderboard not found", "No submissions found for this contest.")
        return []

    return [
        {
            "username": entry.username,
            "solved_problems": entry.solved_problems,
            "total_time": entry.total_time
        }
        for entry in leaderboard
    ]

@router.websocket("/ws/{contest_code}")
async def websocket_endpoint(websocket: WebSocket, contest_code: str):
    await manager.connect(websocket, contest_code)
    print()
    print()
    print(f"Connected to {contest_code}")
    print()
    print()
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, contest_code)