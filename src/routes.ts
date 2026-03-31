import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import AdminLayout from "./components/layouts/AdminLayout";
import PassengerLayout from "./components/layouts/PassengerLayout";
import ConductorLayout from "./components/layouts/ConductorLayout";
import { LiveTracking } from "./components/LiveTracking";
import { FleetManagement } from "./components/FleetManagement";
import { Analytics } from "./components/Analytics";
import { Reports } from "./components/Reports";
import { LostAndFound } from "./components/LostAndFound";
import { LostAndFoundView } from "./components/LostAndFoundView";
import { PassengerPortal } from "./components/PassengerPortal";
import { ConductorPortal } from "./components/conductor/ConductorPortal";
import { BusInfoPublicPage } from "./components/BusInfoPublicPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: LiveTracking },
          { path: "tracking", Component: LiveTracking },
          { path: "fleet", Component: FleetManagement },
          { path: "analytics", Component: Analytics },
          { path: "reports", Component: Reports },
          { path: "lostandfound", Component: LostAndFound },
        ],
      },
      {
        path: "conductor",
        Component: ConductorLayout,
        children: [
          { index: true, Component: ConductorPortal },
        ],
      },
      {
        path: "passenger",
        Component: PassengerLayout,
        children: [
          { index: true, Component: PassengerPortal },
          { path: "lostandfound", Component: LostAndFoundView },
        ],
      },
      {
        path: "bus/track/:busId",
        Component: BusInfoPublicPage
      }
    ],
  },
]);