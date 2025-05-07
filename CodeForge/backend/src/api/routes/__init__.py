from pydantic import BaseModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict


class ProblemDetails(BaseModel):
    title: str
    difficulty: str
    problem_statement: str
    constraints: str
    testcases: list[dict[str, str]]
    owner: str


class ProblemList(BaseModel):
    code: str
    title: str
    difficulty: str
    is_solved: bool


class Error(BaseModel):
    error: str
    message: str | None = None

    def __init__(self, error: str, message: str | None = None, **kwargs):
        super().__init__(error=error, message=message, **kwargs)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, contest_code: str):
        await websocket.accept()
        if contest_code not in self.active_connections:
            self.active_connections[contest_code] = []
        self.active_connections[contest_code].append(websocket)

    def disconnect(self, websocket: WebSocket, contest_code: str):
        self.active_connections[contest_code].remove(websocket)
        # if not self.active_connections[contest_code]:
        #     del self.active_connections[contest_code]

    async def broadcast(self, contest_code: str, message: str):
        if contest_code in self.active_connections:
            print()
            print(f"Broadcasting to {len(self.active_connections[contest_code])} connections")
            print()
            print()
            for connection in self.active_connections[contest_code]:
                
                await connection.send_text(message)
                

manager = ConnectionManager()