# Backend

## Setup

### Install `uv`

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Relaunch terminal after installation.

### Setup virtualenv

```bash
uv sync
```
- `.venv` is created inside the backend folder. 

### Select python interpreter in VSCode

- Open a python file in VSCode.

- Go to the bottom right corner of VSCode. Click on Python version

- Select: Enter interpreter path > Find

- Select the `.venv/bin/python` as the interpreter in the current folder.

- Relaunch terminal after selecting.

## Running server

Inside backend folder, run:

```bash
fastapi dev src/api
```

## DB Schema

### problems

```
id
title
difficulty
problem_statement
constraints
owner
contest_id
```

```
id
testcases
```

```
id
username
status
```

### contensts

```
id
title
description
owner
```

## TODO

- [ ] Get all problems: code, title, difficulty, owner, contest_id, is_solved
- [ ] Get a problem: code, title, difficulty, owner, contest_id, is_solved, problem_statement, constraints, testcases
- [ ] Submit a problem: Run and store in Submission table
- [ ] Leaderboard: username, solved_problems_count, total_elapsed_time
  - [ ] Websockets for real-time leaderboard