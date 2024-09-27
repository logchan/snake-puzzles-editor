import { Box, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { useCallback, useEffect, useState } from "react";
import { client } from "../Client";
import { getInput, getJsonBox } from "../util/inputUtil";
import { Fruit, Level, loadLevelJson, SnakeBlock, Tile, TileType } from "../util/modelUtil";

const keyTypeMapping = new Map<string, TileType>([
  [" ", TileType.Plain],
  ["g", TileType.Goal],
  ["o", TileType.Occupy],
  ["x", TileType.Wall],
  ["e", TileType.Empty],
  ["t", TileType.Triangle],
]);

const displayMapping = new Map<TileType, string>([
  [TileType.Plain, ""],
  [TileType.Goal, "G"],
  [TileType.Occupy, "O"],
  [TileType.Wall, "X"],
  [TileType.Empty, "E"],
  [TileType.Triangle, "T"],
]);

const defaultArgs = new Map<TileType, string[]>([
  [TileType.Triangle, ["1"]],
]);

class TileInfo {
  tile: Tile | null = null;
  snake: SnakeBlock | null = null;
  fruit: Fruit | null = null;
}

function RenderTile(info: TileInfo, snake: SnakeBlock[]) {
  const text = [];
  if (info.tile && info.tile.TileType !== TileType.Plain) {
    text.push(displayMapping.get(info.tile.TileType) + info.tile.TileArgs.join(";"));
  }
  if (info.snake) {
    text.push(snake.findIndex(b => b.X === info.snake?.X && b.Y === info.snake.Y));
    if (info.snake.IsEmpty) {
      text[text.length - 1] += "^";
    }
  }
  if (info.fruit) {
    text.push("F");
    if (info.fruit.IsEmpty) {
      text[text.length - 1] += "^";
    }
    if (info.fruit.IsPersistent) {
      text[text.length - 1] += "*";
    }
  }
  return (
    <Typography>{text.join("|")}</Typography>
  );
}

export default function EditorView() {
  const [tiles, setTiles] = useState<TileInfo[][]>([]);
  const [snake, setSnake] = useState<SnakeBlock[]>([]);
  const [selX, setSelX] = useState(-1);
  const [selY, setSelY] = useState(-1);
  const [isWitness, setIsWitness] = useState(false);
  const notifications = useNotifications();

  const showError = useCallback((msg: string) => {
    notifications.show(msg, { severity: "error", autoHideDuration: 2000 });
  }, [notifications]);
  const showSuccess = useCallback((msg: string) => {
    notifications.show(msg, { severity: "success", autoHideDuration: 1000 });
  }, [notifications]);

  const makeLevelJson = useCallback(() => {
    const level = new Level();
    level.Rows = tiles.length;
    level.Columns = (tiles[0] || []).length;
    level.SpecialTiles = tiles.flatMap(row => row.map(t => t.tile).filter(t => t !== null)) as Tile[];
    level.StartSnake.Blocks = snake;
    level.Fruits = tiles.flatMap(row => row.map(t => t.fruit).filter(t => t !== null)) as Fruit[];
    level.IsWitness = isWitness;
    level.HelpText = getInput("level-helptext").value;
    return JSON.stringify(level, null, 2);
  }, [tiles, snake, isWitness]);

  // handle reset layout
  useEffect(() => {
    const setLayoutHandler = () => {
      const rows = Number(getInput("layout-rows").value);
      const cols = Number(getInput("layout-cols").value);
      if (rows <= 0 || rows >= 100 || cols <= 0 || cols >= 100) {
        showError("Invalid input");
        return;
      }

      const currRows = tiles.length;
      const currCols = (tiles[0] || []).length;

      // If shrinking, prevent from removing existing tiles and snake
      let safe = true;
      for (let y = 0; y < currRows; ++y) {
        for (let x = 0; x < currCols; ++x) {
          if (y < rows && x < cols) {
            continue;
          }

          if (tiles[y][x].tile || tiles[y][x].snake || tiles[y][x].fruit) {
            safe = false;
            break;
          }
        }
        if (!safe) {
          break;
        }
      }
      if (!safe) {
        showError("Shrinking would remove special tiles or snake");
        return;
      }

      let result = tiles.slice(0, rows).map(row =>
        row.length >= cols ? row.slice(0, cols) : row.concat(Array(cols - row.length).fill(0).map(() => new TileInfo()))
      );
      if (result.length < rows) {
        result = result.concat(Array(rows - result.length).fill(0).map(() => Array(cols).fill(0).map(() => new TileInfo())));
      }
      setTiles(result);
      setSelX(-1);
      setSelY(-1);
    };
    window.addEventListener("setLayout", setLayoutHandler);
    return () => {
      window.removeEventListener("setLayout", setLayoutHandler);
    };
  }, [tiles, snake, showError]);

  // handle keyboard input
  useEffect(() => {
    const keyPressHandler = (ev: KeyboardEvent) => {
      if (ev.target !== document.body) {
        return;
      }
      if (selX < 0 || selY < 0) {
        return;
      }

      ev.preventDefault();

      const key = ev.key;
      const info = tiles[selY][selX];
      if (keyTypeMapping.has(key)) {
        const newType = keyTypeMapping.get(key)!;
        if (newType === info.tile?.TileType) {
          return;
        }

        if (newType === TileType.Plain) {
          info.tile = null;
        }
        else if (info.tile) {
          info.tile.TileType = newType;
          info.tile.TileArgs = defaultArgs.get(newType) || [];
        }
        else {
          info.tile = new Tile(selX, selY, newType);
          info.tile.TileArgs = defaultArgs.get(newType) || [];
        }

        setTiles([...tiles]);
        return;
      }

      if (key === "s" && !info.snake) {
        // only append snake if connected to tail
        if (snake.length > 0) {
          const tail = snake[snake.length - 1];
          if (!(
            (tail.X === selX && (tail.Y === selY - 1 || tail.Y === selY + 1)) ||
            (tail.Y === selY && (tail.X === selX - 1 || tail.X === selX + 1))
          )) {
            return;
          }
        }

        // append snake
        info.snake = new SnakeBlock(selX, selY, false);
        setTiles([...tiles]);
        setSnake([...snake, info.snake]);
        return;
      }

      if (key === "s" && info.snake) {
        const tail = snake[snake.length - 1];
        if (tail.X !== selX || tail.Y !== selY) {
          return;
        }

        info.snake = null;
        const newSnake = snake.slice(0, snake.length - 1);
        if (newSnake.length > 0) {
          const newTail = newSnake[newSnake.length - 1];
          setSelX(newTail.X);
          setSelY(newTail.Y);
        }
        setTiles([...tiles]);
        setSnake(newSnake);
        return;
      }

      if (key === "Enter" && info.tile && defaultArgs.has(info.tile.TileType)) {
        const oldArgs = info.tile.TileArgs.join("; ");
        const newArgs = prompt("Args separated by ;", oldArgs);
        if (newArgs !== null && newArgs !== oldArgs) {
          info.tile.TileArgs = newArgs.split(";").map(s => s.trim());
          setTiles([...tiles]);
        }
        return;
      }

      if (key === "f" && !info.fruit && !info.snake) {
        info.fruit = new Fruit(selX, selY);
        setTiles([...tiles]);
        return;
      }

      if (key === "f" && info.fruit) {
        info.fruit = null;
        setTiles([...tiles]);
        return;
      }

      if (key === "p" && info.fruit) {
        info.fruit.IsPersistent = !info.fruit.IsPersistent;
        setTiles([...tiles]);
        return;
      }

      if (key === "/") {
        if (info.fruit) {
          info.fruit.IsEmpty = !info.fruit.IsEmpty;
          setTiles([...tiles]);
        }
        if (info.snake) {
          info.snake.IsEmpty = !info.snake.IsEmpty;
          setTiles([...tiles]);
          setSnake([...snake]);
        }
        return;
      }

      console.log(key);
    };

    window.addEventListener("keypress", keyPressHandler);
    return () => {
      window.removeEventListener("keypress", keyPressHandler);
    };
  }, [tiles, snake, selX, selY]);

  // update level json after edit
  useEffect(() => { getJsonBox().value = makeLevelJson(); }, [makeLevelJson]);

  // upload level json handler
  useEffect(() => {
    const handler = async () => {
      try {
        await client.uploadLevel(makeLevelJson());
        showSuccess("Uploaded level");
      }
      catch (ex) {
        console.error(ex);
        showError("Upload level failed");
      }
    };

    window.addEventListener("uploadLevel", handler);
    return () => {
      window.removeEventListener("uploadLevel", handler);
    };
  }, [makeLevelJson, showError, showSuccess]);

  // load level json handler
  useEffect(() => {
    const handler = (() => {
      try {
        const level = loadLevelJson(getJsonBox().value);
        const result = Array(level.Rows).fill(0).map(() =>
          Array(level.Columns).fill(0).map(() => new TileInfo())
        );
        level.SpecialTiles.forEach(t => result[t.Y][t.X].tile = t);
        level.StartSnake.Blocks.forEach(b => result[b.Y][b.X].snake = b);
        level.Fruits.forEach(f => result[f.Y][f.X].fruit = f);

        getInput("layout-rows").value = level.Rows.toString();
        getInput("layout-cols").value = level.Columns.toString();
        setTiles(result);
        setSnake(level.StartSnake.Blocks);
        setSelX(-1);
        setSelY(-1);
        setIsWitness(level.IsWitness);
        getInput("level-helptext").value = level.HelpText;
        showSuccess("Loaded level from JSON");
      }
      catch (ex) {
        showError(`Can't load JSON: ${ex}`);
      }
    });

    window.addEventListener("loadLevel", handler);
    return () => {
      window.removeEventListener("loadLevel", handler);
    };
  }, [showError, showSuccess]);

  // reset level button
  useEffect(() => {
    const handler = (() => {
      setTiles(tiles.map(row => Array(row.length).fill(0).map(() => new TileInfo())));
      setSnake([]);
      setSelX(-1);
      setSelY(-1);
    });

    window.addEventListener("resetLevel", handler);
    return () => {
      window.removeEventListener("resetLevel", handler);
    };
  }, [tiles]);

  const rows = tiles.length;
  const cols = (tiles[0] || []).length;
  const colmunTemplate = "40px ".repeat(cols);
  const gap = "4px";
  return (
    <Stack direction="column">
      <Stack direction="row" spacing={1}>
        <TextField id="level-helptext" size="small" placeholder="Help text"></TextField>
        <FormControlLabel
          label="Witness"
          control={
            <Checkbox
              checked={isWitness}
              onChange={() => setIsWitness(!isWitness)}
            />
          }
        />
      </Stack>
      <Box sx={{
        backgroundColor: "lightyellow",
        padding: "12px",
      }}>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: colmunTemplate,
          columnGap: gap,
          rowGap: gap,
        }}>
          {Array.from(Array(rows).keys()).reverse().flatMap(y => Array.from(Array(cols).keys()).map(x => {
            const classNames = ["tile-container"];
            if (x === selX && y === selY) {
              classNames.push("tile-container-selected");
            }
            if (isWitness && x % 2 === 1 && y % 2 === 1) {
              classNames.push("tile-container-witness-blocked");
            }
            return (
              <div key={`${y}-${x}`} className={classNames.join(" ")} onClick={() => {
                setSelX(x);
                setSelY(y);
              }}>{RenderTile(tiles[y][x], snake)}</div>
            );
          }
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
