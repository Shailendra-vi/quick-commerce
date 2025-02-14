import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types/type";
import {
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

const CustomerOrderHistory = ({ onClose }: { onClose: () => void }) => {
  const { user, token } = useAuth();
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPastOrders();
  }, []);

  const getPastOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/history/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setOrderHistory(data);
      } else {
        toast.error("Failed to fetch past orders");
      }
    } catch (error) {
      toast.error("An error occurred while fetching past orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md mt-6 p-4">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Past Orders
        </Typography>
        {/* <Button 
          variant="contained" 
          color="primary" 
          onClick={getPastOrders} 
          disabled={loading}
        >
          {loading ? "Fetching..." : "Show Past Orders"}
        </Button> */}
        {orderHistory.length > 0
          ? orderHistory.map((order) => (
              <Card key={order._id} className="mt-4 shadow-sm p-3">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Order ID: {order._id}
                  </Typography>
                  <Typography>Quantity: {order.quantity}</Typography>
                  <Typography>Location: {order.location}</Typography>
                  <Typography>Status: {order.status}</Typography>
                </CardContent>
              </Card>
            ))
          : orderHistory.length === 0 &&
            !loading && (
              <Typography variant="h6" className="mt-4">
                No past orders found.
              </Typography>
            )}
      </CardContent>
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        className="mt-3"
        onClick={onClose}
      >
        Close
      </Button>
    </Card>
  );
};

export default CustomerOrderHistory;
