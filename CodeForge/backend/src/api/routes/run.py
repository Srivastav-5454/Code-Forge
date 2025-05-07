import os
import shutil
import subprocess
import tempfile
import threading
import time
import traceback
import logging
from enum import Enum
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/run")


class Language(Enum):
    PYTHON = "py"
    JAVASCRIPT = "js"


class RunRequest(BaseModel):
    source_code: str
    input_data: Optional[str] = None
    language: Language
    username: Optional[str] = None


class RunResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    return_code: Optional[int] = None
    elapsed_time: Optional[float] = None
    memory_usage: Optional[float] = None
    timeout: bool = False
    test_passed: bool = False
    message: str


@router.post("/")
def run_code(request_data: RunRequest) -> RunResponse:
    source_code = request_data.source_code
    input_data = request_data.input_data
    language = request_data.language

    tempdir = tempfile.mkdtemp(prefix="codeforge_")
    file_name = write_source_code_to_file(source_code, tempdir, language)

    try:
        command = get_command_for_language(file_name, language)
        result = run_command(command, input_data, tempdir)
    finally:
        cleanup(tempdir)

    if result.message:
        return result

    if result.timeout:
        result.message = "Time limit exceeded"
    elif result.return_code != 0:
        result.message = "Runtime error"
    elif result.return_code is None:
        result.message = "Server error"
    else:
        result.message = "Success"

    return result


def write_source_code_to_file(source_code: str, tempdir: str, language: Language) -> str:
    file_name = os.path.join(tempdir, f"main.{language.value}")
    with open(file_name, "w") as f:
        logger.debug(f"Writing source code to {file_name}")
        f.write(source_code)
    return file_name


def get_command_for_language(file_name: str, language: Language) -> list:
    if sys.platform == "win32":  # Check if running on Windows
        if language == Language.PYTHON:
            return [r"C:\\Users\\VARMA\\AppData\\Local\\Microsoft\\WindowsApps\\python3.exe", file_name]  # Correct path for Windows
        elif language == Language.JAVASCRIPT:
            return ["node", file_name]  # Node should be in your PATH
        else:
            raise ValueError("Invalid language for Windows")

    # Unix-based environments (Linux/macOS)
    else:
        if language == Language.PYTHON:
            return [".venv/Scripts/python3", file_name]  # Linux/MacOS path
        elif language == Language.JAVASCRIPT:
            return ["/bin/node", file_name]
        else:
            raise ValueError("Invalid language for Unix-based OS")


def cleanup(tempdir: str):
    logger.debug(f"Cleaning up temporary directory: {tempdir}")
    shutil.rmtree(tempdir)


def run_command(command, input_string, tempdir, timeout=5, memory_limit=1000) -> RunResponse:
    result = RunResponse(message="")

    def target(command, input_string):
        try:
            nsjail_cmd = [
                "nsjail", "-Mo", "-q", "--user", "99999", "--group", "99999",
                f"--rlimit_as={memory_limit}", f"--time_limit={timeout}",
                "-R", "/bin/", "-R", "/lib/", "-R", "/lib64/", "-R", "/usr/", "-R", "/etc/alternatives/",
                "-B", tempdir, "-D", tempdir, "--keep_env", "--"
            ]
            time_cmd = ["/bin/time", "-a", "-f", "%E %M", "--"]
            command = nsjail_cmd + time_cmd + command

            logger.debug(f"Executing command: {' '.join(command)}")

            process = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            stdout, stderr = process.communicate(input=input_string, timeout=timeout)

            split_stderr = stderr.splitlines()
            stderr, time_output = ("\n".join(split_stderr[:-1]), split_stderr[-1]) if len(split_stderr) > 1 else ("", stderr)

            elapsed_time, memory_usage = time_output.split()
            elapsed_time = time_to_seconds(elapsed_time)
            memory_usage = int(memory_usage)

            if process.returncode == 137:
                result.timeout = True

            result.stdout = stdout
            result.stderr = stderr
            result.return_code = process.returncode
            result.elapsed_time = round(elapsed_time, 3)
            result.memory_usage = round(memory_usage / 1024, 3)  # MB

        except subprocess.TimeoutExpired:
            process.kill()
            result.timeout = True
        except Exception as e:
            traceback.print_exc()
            result.message = str(e)

    thread = threading.Thread(target=target, args=(command, input_string))
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        result.timeout = True
        thread.join()

    return result


def time_to_seconds(time_str: str) -> float:
    parts = time_str.split(":")
    seconds = 0

    if len(parts) == 3:
        seconds += int(parts[0]) * 3600  # hours to seconds
        parts = parts[1:]

    seconds += int(parts[0]) * 60  # minutes to seconds

    if "." in parts[1]:
        secs, msecs = parts[1].split(".")
        seconds += int(secs)
        seconds += int(msecs) / 100
    else:
        seconds += int(parts[1])

    return seconds
