import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:cartproducts',
      );

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let newProducts: Product[] = [];
      const productToAdd = products.find(item => item.id === product.id);

      if (productToAdd) {
        productToAdd.quantity += product.quantity;
        newProducts = [...products];
      } else {
        newProducts = [...products, product];
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartproducts',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
      // TODO ADD A NEW ITEM TO THE CART
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productToAdd = products.find(item => item.id === id);

      if (productToAdd) {
        productToAdd.quantity += 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartproducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productToRemove = products.find(item => item.id === id);

      let newProducts: Product[] = [];

      if (productToRemove) {
        productToRemove.quantity -= 1;

        if (productToRemove.quantity === 0) {
          newProducts = products.filter(product => product.id !== id);
          setProducts(newProducts);
        } else {
          newProducts = products;
          setProducts([...newProducts]);
        }
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cartproducts',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
