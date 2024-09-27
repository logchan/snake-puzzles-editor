enum TileType {
  Plain = "Plain",
  Goal = "Goal",
  Occupy = "Occupy",
  Wall = "Wall",
  Empty = "Empty",
  Triangle = "Triangle",
}

export class SnakeBlock {
  X: number;
  Y: number;
  IsEmpty: boolean;
  constructor(x: number, y: number, isEmpty: boolean) {
    this.X = x;
    this.Y = y;
    this.IsEmpty = isEmpty;
  }
}

export class Snake {
  Blocks: SnakeBlock[] = [];
}

export class Tile {
  X: number;
  Y: number;
  TileType: TileType;
  TileArgs: string[] = [];
  constructor(x: number, y: number, type: TileType) {
    this.X = x;
    this.Y = y;
    this.TileType = type;
  }
}

export class Fruit {
  X: number;
  Y: number;
  IsEmpty = false;
  IsPersistent = false;
  constructor(x: number, y: number) {
    this.X = x;
    this.Y = y;
  }
}

export class Level {
  Name = "";
  Rows = 0;
  Columns = 0;
  StartSnake = new Snake();
  SpecialTiles: Tile[] = [];
  Fruits: Fruit[] = [];
  IsWitness = false;
  HelpText = "";
}

export function loadLevelJson(text: string): Level {
  const level = Object.assign(new Level(), JSON.parse(text)) as Level;
  for (let i = 0; i < level.Fruits.length; ++i) {
    level.Fruits[i] = Object.assign(new Fruit(0, 0), level.Fruits[i]);
  }
  for (let i = 0; i < level.StartSnake.Blocks.length; ++i) {
    level.StartSnake.Blocks[i] = Object.assign(new SnakeBlock(0, 0, false), level.StartSnake.Blocks[i]);
  }
  return level;
}

export { TileType };
