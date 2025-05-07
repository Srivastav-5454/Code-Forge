from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.models import Users, init_db
from api.routes import contests, problems, run

app = FastAPI()
app.include_router(run.router)
app.include_router(contests.router)
app.include_router(problems.router)

init_db()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    username: str




@app.post("/user")
def create_user(user: User) -> Users:
    user = Users(username=user.username)
    user.create()
    return user