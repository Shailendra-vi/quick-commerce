"use client";

import { useAuth } from "@/context/AuthContext";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Welcome, {user?.name?.toUpperCase()}
        </Typography>
        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
