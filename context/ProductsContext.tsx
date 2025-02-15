"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product, ProductContext } from "@/types/type";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

const ProductsContext = createContext<ProductContext | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[] | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { token } = useAuth();

  const router = useRouter();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${page}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (name: string, price: Number, category: string) => {
    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price, category }),
      });

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!token) {
      router.push("/signin");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/products`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        loading,
        products,
        setProducts,
        addProduct,
        deleteProduct,
        totalPages,
        fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
