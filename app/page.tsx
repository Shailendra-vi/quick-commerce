"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Delivery from "@/components/Delivery";
import Customer from "@/components/Customer";
import {
  Box,
  CircularProgress,
} from "@mui/material";

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
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

      {user.role === "customer" ? <Customer /> : <Delivery />}
    </div>
  );
}
