"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Delivery from "@/components/Delivery";
import Customer from "@/components/Customer";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";

export default function Home() {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
    }
    if (token && !user) {
      fetchUserRole();
      return;
    }

    async function fetchUserRole() {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
      } else {
        router.push("/signin");
      }
    }
  }, []);

  if (!user || !user.role || !user.name)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {user?.name?.toUpperCase()}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {user.role === "customer" ? <Customer /> : <Delivery />}
    </div>
  );
}
