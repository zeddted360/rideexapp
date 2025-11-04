import AddFoodItemForm from "@/components/vendor/AddItemForm";
import { cookies } from "next/headers";

export const metadata = {
  title: "Vendor Add Item | RideEx Food Ordering App",
  description: "Add a new food item to the RideEx Food Ordering App menu.",
  openGraph: {
    title: "Add Item | RideEx Food Ordering App",
    description: "Add a new food item to the RideEx Food Ordering App menu.",
    url: "/add-item",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Item | RideEx Food Ordering App",
    description: "Add a new food item to the RideEx Food Ordering App menu.",
  },
};

const AddItemPage = async () => {
  const cookie = (await cookies()).getAll();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AddFoodItemForm/>
    </div>
  );
};

export default AddItemPage;