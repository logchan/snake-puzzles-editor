import { Box } from "@mui/material";
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import MainView from "./view/MainView";
import TopBar from "./view/TopBar";

export default function App() {
  return (
    <NotificationsProvider>
      <Box>
        <TopBar />
        <MainView />
      </Box>
    </NotificationsProvider>
  );
}
