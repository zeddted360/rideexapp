"use client";
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react";
import { ICartItem } from "../../types/types";

interface IContextProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  item: ICartItem;
  setItem: Dispatch<SetStateAction<ICartItem>>;
  activeCart: boolean;
  setActiveCart: Dispatch<SetStateAction<boolean>>;
}

const ShowCartContext = createContext<IContextProps | undefined>(undefined);

export const ShowCartContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<ICartItem>({
    userId: "",
    itemId: "",
    name: "",
    price: "",
    quantity: 1,
    image: "",
    restaurantId: "",
    category: "",
    source: "",
  });
  const [activeCart, setActiveCart] = useState<boolean>(false);

  return (
    <ShowCartContext.Provider
      value={{ isOpen, setIsOpen, item, setItem, activeCart, setActiveCart }}
    >
      {children}
    </ShowCartContext.Provider>
  );
};

export const useShowCart = () => {
    const context = useContext(ShowCartContext);

    if (!context) {
        throw new Error("useShowCart must be used within a ShowCartContextProvider");
    };

    return context;
}