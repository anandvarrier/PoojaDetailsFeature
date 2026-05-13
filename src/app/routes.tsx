import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { BrowsePage } from "./pages/BrowsePage";
import { AllPujasPage } from "./pages/AllPujasPage";
import { PoojaDetailsPage } from "./pages/PoojaDetailsPage";
import { DateTimePage } from "./pages/DateTimePage";
import { InvoicePage } from "./pages/InvoicePage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: BrowsePage },
      { path: "all-pujas", Component: AllPujasPage },
      { path: "pooja/:id", Component: PoojaDetailsPage },
      { path: "pooja/:id/book", Component: DateTimePage },
      { path: "booking/invoice", Component: InvoicePage },
      { path: "order-history", Component: OrderHistoryPage },
    ],
  },
]);