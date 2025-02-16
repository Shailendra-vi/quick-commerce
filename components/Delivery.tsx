"use client";

import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { Order } from "@/types/type";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Container,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const socket = io();

interface NewProduct {
  name: string;
  price: string;
  category: string;
}

function Delivery() {
  const { loading, products, addProduct, deleteProduct, fetchProducts } =
    useProducts();
  const { token, user } = useAuth();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          await fetchOrders();
          await fetchProducts();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      })();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/orders/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      socket.emit("joinRoom", user?._id);
      socket.on("newOrder", (newOrder) => {
        setOrders((prev) => [...prev, newOrder]);
      });
      socket.on("orderDelete", (orderId) => {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      });
    }
    return () => {
      socket.off("newOrder");
      socket.off("orderDelete");
    };
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated!");
      }
    } catch (error) {
      toast.error("Error updating order status");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    await addProduct(
      newProduct.name,
      parseFloat(newProduct.price),
      newProduct.category
    );
    setNewProduct({ name: "", price: "", category: "" });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <div className="flex gap-5">
        <div className="flex-[3]">
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              New Product
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Product Name"
                    name="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Product Price"
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Product Category"
                    name="category"
                    type="text"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : "Add Product"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
          <Grid container spacing={3}>
            {products?.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card className="h-full">
                  <CardContent className="h-full flex flex-col justify-between">
                    <div>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography color="textSecondary">
                        ${product.price}
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={async () => await deleteProduct(product._id)}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 3 }}
          className="flex-[1]"
        >
          {loadingOrders ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => router.push("/history")}
              >
                Delivered Orders
              </Button>
              <Grid container spacing={3} className="mt-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Grid item xs={12} key={order._id}>
                      <Card
                        elevation={4}
                        sx={{ borderRadius: 2 }}
                        className="h-full"
                      >
                        <CardContent className="h-full flex flex-col justify-between">
                          <Typography variant="h6">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </Typography>
                          <Typography>{order.customerId.name}</Typography>
                          <Typography>{order.customerId.email}</Typography>
                          <Typography>
                            {order.productId.name} - ${order.productId.price}
                          </Typography>
                          <Typography>Quantity: {order.quantity}</Typography>
                          <Select
                            fullWidth
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            sx={{ mt: 2 }}
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Accepted">Accepted</MenuItem>
                            <MenuItem value="Out for Delivery">
                              Out for Delivery
                            </MenuItem>
                            <MenuItem value="Delivered">Delivered</MenuItem>
                          </Select>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography align="center" sx={{ width: "100%", mt: 2 }}>
                    No orders found.
                  </Typography>
                )}
              </Grid>
            </>
          )}
        </Paper>
      </div>
    </Container>
  );
}

export default Delivery;
