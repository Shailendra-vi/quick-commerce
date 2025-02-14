"use client";

import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { Order } from "@/types/type";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

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

  const [orders, setOrders] = useState<Order[] | []>([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProducts();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders/${user?._id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user && socket && socket.connected) {
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
  }, [user, socket]);

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
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    await addProduct(newProduct.name, parseFloat(newProduct.price));
    setNewProduct({ name: "", price: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev: NewProduct) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Products Dashboard
      </h1>

      {/* Add Product Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 p-6 border rounded-lg shadow-lg bg-white flex flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleChange}
          className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="number"
          name="price"
          placeholder="Product Price"
          value={newProduct.price}
          onChange={handleChange}
          className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 rounded-md disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div
            key={product._id}
            className="p-4 border rounded-lg shadow-lg bg-white flex flex-col gap-2"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
            <button
              onClick={async () => await deleteProduct(product._id)}
              className="bg-red-500 text-white flex items-center gap-2 px-3 py-1 mt-2 rounded-md"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Orders Section */}
      <h2 className="text-2xl font-bold text-center my-6">Customer Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="p-4 border rounded-lg shadow-lg bg-white flex flex-col gap-3"
            >
              <h3 className="text-lg font-semibold">Order #{order._id}</h3>
              {/* <p className="text-gray-700">Customer: {order.customerName}</p>
              <p className="text-gray-700">Total: ${order.totalPrice}</p> */}
              <p className="text-gray-700">Status: {order.status}</p>
              <select
                className="p-2 border rounded-md"
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            No orders found.
          </p>
        )}
      </div>
    </div>
  );
}

export default Delivery;
