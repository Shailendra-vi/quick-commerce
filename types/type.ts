interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "delivery";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface Product {
  _id: string;
  name: string;
  price: string;
}

interface ProductContext {
  loading: boolean;
  products: Product[] | undefined;
  setProducts: React.Dispatch<React.SetStateAction<Product[] | undefined>>;
  addProduct: (name: string, price: Number) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  fetchProducts: () => {};
}

interface Order {
  _id: string;
  quantity: number;
  location: string;
  status: string;
}

export type { User, AuthContextType, Product, ProductContext, Order };
