from flask import Flask, request

app = Flask(__name__, static_folder="build", static_url_path="/")

current_command = {
    "command": "",
    "payload": "",
}


def clear_command():
    for key in current_command:
        current_command[key] = ""


@app.get("/api/snake-game-ping")
def api_ping():
    return {"response": "ok"}


@app.post("/api/set-command")
def api_set_command():
    req = request.json
    current_command["command"] = req["command"]
    current_command["payload"] = req["payload"]
    return {}


@app.get("/api/get-command")
def api_get_command():
    result = dict(current_command)
    clear_command()
    return result


@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def catch_all(path):
    return app.send_static_file("index.html")
