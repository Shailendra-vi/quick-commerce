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
} from "@mui/material";
import { toast } from "react-toastify";
import CompletedOrders from "./CompletedOrders";

const socket = io();

interface NewProduct {
  name: string;
  price: string;
}

function Delivery() {
  const { loading, products, addProduct, deleteProduct, fetchProducts } =
    useProducts();
  const { token, user } = useAuth();
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProducts();
    }
  }, [user]);

  const fetchOrders = async () => {
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
    }
  };

  useEffect(() => {
    if (user && socket.connected) {
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
    await addProduct(newProduct.name, parseFloat(newProduct.price));
    setNewProduct({ name: "", price: "" });
  };

  return (
    <Container maxWidth="lg" className="py-8">
      {showOrderHistory ? (
        <CompletedOrders onClose={() => setShowOrderHistory(false)} />
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
          <Typography variant="h4" align="center" gutterBottom>
            Products Dashboard
          </Typography>
          <form
            onSubmit={handleSubmit}
            className="mb-6 flex flex-col gap-4 p-6 bg-white shadow-md rounded-lg"
          >
            <TextField
              label="Product Name"
              name="name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              fullWidth
            />
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </form>

          <Grid container spacing={3}>
            {products?.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card className="shadow-md">
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography color="textSecondary">
                      ${product.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={async () => await deleteProduct(product._id)}
                      className="mt-2"
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h4" align="center" gutterBottom className="mt-8">
            Customer Orders
          </Typography>
          <Grid container spacing={3}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order._id}>
                  <Card className="shadow-md">
                    <CardContent>
                      <Typography variant="h6">Order #{order._id}</Typography>
                      <Typography>Status: {order.status}</Typography>
                      <Select
                        fullWidth
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
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
              <Typography align="center" className="text-gray-600 w-full">
                No orders found.
              </Typography>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default Delivery;
