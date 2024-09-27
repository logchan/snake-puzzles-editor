import { Stack, Typography } from "@mui/material";

const helpSections = [
  ["Edit", `First, set a layout.
Click on grid cell to select.
Press to set cell type:
  G - Goal
  X - Wall
  O - Occupy
  E - Empty
  T - Triangles (press Enter to edit number)
  Space - Clear

Press S to set snake head and body.
Select tail and press S to remove body.

Press F to set or unset fruit.
For fruit and snake, press / to toggle empty.
For fruit, press P to toggle undo-persistence.
`],
  ["Connect to Game", `You must run the level editor locally with flask run!
Start a level in game.
Press F12 to open debug menu.
Click "Start HTTP" button at bottom-left. If it doen't change to "HTTP ON", make sure your flask app is running.

In the level editor, click the upload button on top to play level.
`]
];

export default function HelpView() {
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h4">Snake Puzzles Editor</Typography>
      <Typography variant="subtitle1">Made for <a href="https://logu.cc" target="_blank">Snake Puzzles</a> by logchan</Typography>
      {window.location.hostname !== "logu.cc" ? null :
        <Typography variant="body1">See <a href="https://github.com/logchan/snake-puzzles-editor" target="_blank">instructions</a> to run locally and connect to the game</Typography>
      }
      {helpSections.map((section) => {
        const [title, content] = section;
        return (<>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body1" whiteSpace="pre-line">{content}</Typography>
        </>);
      })}
    </Stack>
  );
}
