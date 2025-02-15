"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types/type";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CustomerOrderHistory = () => {
  const { user, token } = useAuth();
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getPastOrders();
    }
  }, [user]);

  const getPastOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/history/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setOrderHistory(data);
    } catch (error) {
      toast.error("Failed to fetch past orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Past Orders
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card elevation={3} sx={{ borderRadius: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Order ID: {order._id}
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body1">
                        {order.productId.name} - ${order.productId.price}
                      </Typography>
                      {user?.role !== "customer" && (
                        <>
                          <Typography variant="body1">
                            {order.customerId.name}
                          </Typography>
                          <Typography variant="body1">
                            {order.customerId.email}
                          </Typography>
                        </>
                      )}
                      <Typography variant="body1">
                        Quantity: {order.quantity}
                      </Typography>
                      <Typography variant="body1">
                        Location: {order.location}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        Status: {order.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography textAlign="center" color="textSecondary">
                No past orders found.
              </Typography>
            </Grid>
          )}
        </Grid>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 4, py: 1.5, fontSize: "1rem" }}
          onClick={() => router.push("/")}
        >
          Close
        </Button>
      </Paper>
    </Container>
  );
};

export default CustomerOrderHistory;
