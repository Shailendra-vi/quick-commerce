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
  Chip,
  Pagination,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const socket = io();

const statusColors: {
  [key: string]: "warning" | "info" | "primary" | "success";
} = {
  Pending: "warning",
  Accepted: "info",
  "Out for delivery": "primary",
  Delivered: "success",
};

const Customer = () => {
  const {
    loading,
    aiRecommendationLoading,
    products,
    totalPages,
    fetchProducts,
    getAIRecommendations,
  } = useProducts();
  const { token, user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<{ [key: string]: number }>(
    {}
  );

  const [location, setLocation] = useState("");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [isAIActive, setIsAIActive] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (token) {
      isAIActive ? getAIRecommendations() : fetchProducts(page);
    }
  }, [token, page]);

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
      const response = await fetch(`/api/orders/customer/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setOrderHistory(data.orders || []);
    } catch (error) {
      toast.error((error as Error).message);
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
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };


  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <div className="flex gap-5">
        <div className="flex-[3]">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              Products
            </Typography>
            <div className="flex gap-4">
              <TextField
                fullWidth
                label="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 4 }}
                className="flex-[4] mb-0"
              />
              <Button
                variant={isAIActive ? "contained" : "outlined"}
                color="error"
                disabled={aiRecommendationLoading}
                onClick={() => {
                  isAIActive ? fetchProducts(page) : getAIRecommendations();
                  setIsAIActive(!isAIActive);
                }}
                className="flex-[1] p-0"
              >
                AI Recommendations
              </Button>
            </div>

            {loading || aiRecommendationLoading ? (
              <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} className="mt-4">
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
                {!isAIActive && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </Grid>
            )}
          </Paper>
        </div>
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 3 }}
          className="flex-[1]"
        >
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => router.push("/history")}
          >
            Orders History
          </Button>
          <Grid container spacing={3} className="mt-4">
            {orderHistory?.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card elevation={4} sx={{ borderRadius: 2 }} className="h-full">
                  <CardContent className="h-full flex flex-col justify-between">
                    <Typography variant="h6">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </Typography>
                    {order.productId && (
                      <Typography>
                        {order.productId.name} - ${order.productId.price}
                      </Typography>
                    )}
                    <Typography>Quantity: {order.quantity}</Typography>
                    <Typography>Location: {order.location}</Typography>
                    <Chip
                      label={order.status}
                      color={
                        statusColors[order.status as keyof typeof statusColors]
                      }
                    />
                    {order.status !== "Delivered" && (
                      <Button
                        fullWidth
                        color="primary"
                        onClick={() => cancelOrder(order._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </div>
    </Container>
  );
};

export default Customer;
