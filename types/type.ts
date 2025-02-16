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
  aiRecommendationLoading: boolean;
  products: Product[] | undefined;
  setProducts: React.Dispatch<React.SetStateAction<Product[] | undefined>>;
  addProduct: (name: string, price: Number, category: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  totalPages: number,
  fetchProducts: (page?: number | undefined) => Promise<void>;
  getAIRecommendations:  () => {};
}

interface Order {
  [x: string]: any;
  _id: string;
  quantity: number;
  location: string;
  status: string;
}

export type { User, AuthContextType, Product, ProductContext, Order };
