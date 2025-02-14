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
} from "@mui/material";
import { toast } from "react-toastify";

const CustomerOrderHistory = ({ onClose }: { onClose: () => {} }) => {
  const { user, token } = useAuth();
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getPastOrders();
    }
  }, [user]);

  const getPastOrders = async () => {
    try {
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
      <Container>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Past Orders
        </Typography>
        <Grid container spacing={3}>
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card elevation={4} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Order ID: {order._id}
                    </Typography>
                    <Typography>Quantity: {order.quantity}</Typography>
                    <Typography>Location: {order.location}</Typography>
                    <Typography>Status: {order.status}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography textAlign="center">No past orders found.</Typography>
          )}
        </Grid>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 3 }}
          onClick={onClose}
        >
          Close
        </Button>
      </Paper>
    </Container>
  );
};

export default CustomerOrderHistory;
