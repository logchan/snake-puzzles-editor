import { fetchData } from "./util/fetchUtil";

class Client {
  async testConnection() {
    await fetchData("/api/snake-game-ping");
  }

  async uploadLevel(data: string) {
    await fetchData("/api/set-command", "POST", {
      "command": "loadLevel",
      "payload": data,
    });
  }
}

const client = new Client();
export { client };
