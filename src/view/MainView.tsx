import { Stack } from "@mui/material";
import SideBar from "./SideBar";
import EditorView from "./EditorView";

export default function MainView() {
  return (
    <Stack direction="row" spacing={1} sx={{
      marginTop: "56px",
      padding: "12px",
    }}>
      <SideBar />
      <EditorView />
    </Stack>
  );
}
