"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types/type";
import { io } from "socket.io-client";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
import CustomerOrderHistory from "./CustomerOrderHistory";

const socket = io();

const Customer = () => {
  const { loading, products, fetchProducts } = useProducts();
  const { token, user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<{ [key: string]: number }>(
    {}
  );
  const [location, setLocation] = useState("");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    if (token && !products) {
      fetchProducts();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, []);

  useEffect(() => {
    if (socket.connected) {
      socket.emit("joinRoom", user?._id);
      socket.on("orderUpdate", (updatedOrder) => {
        setOrderHistory((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });
    }
    return () => {
      socket.off("orderUpdate");
    };
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/orders/customer/${user?._id}`);
      const data = await response.json();
      if (response.ok) setOrderHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderDetails((prev) => ({ ...prev, [productId]: quantity }));
  };

  const placeOrder = async (productId: string) => {
    if (!token) return toast.error("Please sign in to place an order");
    if (!location) return toast.error("Please enter your location");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: orderDetails[productId] || 1,
          location,
        }),
      });
      if (!response.ok) throw new Error("Failed to place order");
      toast.success("Order placed successfully!");
      fetchHistory();
    } catch (error) {
      toast.error("Error placing order. Please try again.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to cancel order");
      toast.success("Order canceled successfully!");
      fetchHistory();
    } catch (error) {
      toast.error("Error canceling order. Please try again.");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {showOrderHistory ? (
        <CustomerOrderHistory
          onClose={async () => setShowOrderHistory(false)}
        />
      ) : (
        <>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => setShowOrderHistory(true)}
          >
            View Order History
          </Button>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              Products
            </Typography>
            <TextField
              fullWidth
              label="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{ mb: 4 }}
            />
            <Grid container spacing={3}>
              {products?.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card elevation={4} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography color="textSecondary">
                        ${product.price}
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onChange={(e) =>
                          handleQuantityChange(
                            product._id,
                            Number(e.target.value)
                          )
                        }
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => placeOrder(product._id)}
                      >
                        Order
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 6 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              Order History
            </Typography>
            <Grid container spacing={3}>
              {orderHistory?.map((order) => (
                <Grid item xs={12} key={order._id}>
                  <Card elevation={4} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        Order ID: {order._id}
                      </Typography>
                      <Typography>Quantity: {order.quantity}</Typography>
                      <Typography>Location: {order.location}</Typography>
                      <Typography
                        color={
                          order.status === "Pending"
                            ? "warning.main"
                            : "success.main"
                        }
                      >
                        Status: {order.status}
                      </Typography>
                    </CardContent>
                    {order.status === "Pending" && (
                      <CardActions>
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          onClick={() => cancelOrder(order._id)}
                        >
                          Cancel Order
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>{" "}
        </>
      )}
    </Container>
  );
};

export default Customer;
