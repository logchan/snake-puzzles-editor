import { Button, Stack, TextField, Typography } from "@mui/material";
import { LoadLevelEvent, ResetLevelEvent, SetLayoutEvent } from "../CustomEvents";
import { downloadText } from "../util/downloadUtil";

export default function SideBar() {
  return (
    <Stack direction="column" spacing={1} sx={{
      flexBasis: "240px",
      flexShrink: 0,
    }}>
      <Typography variant="h6">Layout</Typography>
      <Stack direction="row" spacing={1}>
        <TextField id="layout-rows" label="Rows" variant="standard" defaultValue="7" />
        <TextField id="layout-cols" label="Columns" variant="standard" defaultValue="7" />
      </Stack>
      <Button variant="outlined"
        onClick={() => {
          dispatchEvent(SetLayoutEvent);
        }}
      >Set</Button>
      <Button variant="outlined" color="error" onClick={() => dispatchEvent(ResetLevelEvent)}>Clear</Button>
      <Typography variant="h6" sx={{ paddingTop: "36px" }}>JSON data</Typography>
      <Typography variant="body1">You can drag-and-drop level JSON file below to load.</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => dispatchEvent(LoadLevelEvent)}>Load</Button>
        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => {
          downloadText(
            (document.getElementById("level-json") as HTMLTextAreaElement).value,
            "snake-" + new Date(Date.now()).toISOString().substring(0, 19).replace(/[T:]/g, "-") + ".json",
          );
        }}>Save</Button>
      </Stack>
      <TextField
        id="level-json"
        label=""
        multiline
        variant="outlined"
        rows={12}
        onDrop={(ev) => {
          ev.preventDefault();
          const file = ev.dataTransfer.files[0];
          if (!file) {
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            (ev.target as HTMLTextAreaElement).value = e.target?.result as string;
            dispatchEvent(LoadLevelEvent);
          };
          reader.readAsText(file, "UTF-8");
        }}

        onDragOver={(ev) => {
          ev.preventDefault();
        }}
      />
    </Stack>
  );
}
