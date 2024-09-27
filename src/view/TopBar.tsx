import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SensorsIcon from '@mui/icons-material/Sensors';
import UploadIcon from '@mui/icons-material/Upload';
import { AppBar, Box, Button, Dialog, DialogActions, DialogContent, Stack, Toolbar, Typography } from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { useState } from "react";
import { client } from "../Client";
import { UploadLevelEvent } from "../CustomEvents";
import HelpView from "./HelpView";
import { StyledIconButton } from "./StyledIconButton";

export default function TopBar() {
  const [showHelp, setShowHelp] = useState(false);
  const notifications = useNotifications();

  return (
    <AppBar position="fixed" className="top-bar" elevation={0}>
      <Toolbar disableGutters>
        <Stack direction="row" sx={{
          alignItems: "center",
          marginLeft: "8px",
          columnGap: "8px",
        }}>
          <Typography variant="h5">Snake Puzzles Editor</Typography>
          <Box sx={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "row",
            columnGap: "8px",
            justifyContent: "flex-end",
            alignItems: "center",
            marginRight: "8px",
          }}>
            <StyledIconButton
              onClick={async () => {
                try {
                  await client.testConnection();
                  notifications.show("Test OK", { severity: "success", autoHideDuration: 1000 });
                }
                catch (err) {
                  console.error(err);
                  notifications.show("Test failed", { severity: "error", autoHideDuration: 1000 });
                }
              }}
            >
              <SensorsIcon />
            </StyledIconButton>
            <StyledIconButton
              onClick={() => window.dispatchEvent(UploadLevelEvent)}
            >
              <UploadIcon />
            </StyledIconButton>
            <StyledIconButton
              onClick={() => setShowHelp(true)}
            >
              <HelpOutlineIcon />
            </StyledIconButton>
          </Box>
        </Stack>
        <Dialog fullWidth maxWidth="sm" open={showHelp} onClose={() => setShowHelp(false)}>
          <DialogContent>
            <HelpView />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHelp(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}
