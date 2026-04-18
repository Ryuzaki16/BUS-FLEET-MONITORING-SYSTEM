import { createBrowserRouter } from 'react-router';
import { Analytics } from './components/Analytics';
import { BusInfoPublicPage } from './components/BusInfoPublicPage';
import { FleetManagement } from './components/FleetManagement';
import { LiveTracking } from './components/LiveTracking';
import { LostAndFound } from './components/LostAndFound';
import { LostAndFoundView } from './components/LostAndFoundView';
import { PassengerPortal } from './components/PassengerPortal';
import { Reports } from './components/Reports';
import Root from './components/Root';
import { ConductorPortal } from './components/conductor/ConductorPortal';
import AdminLayout from './components/layouts/AdminLayout';
import ConductorLayout from './components/layouts/ConductorLayout';
import PassengerLayout from './components/layouts/PassengerLayout';
import { QrTrackingLayout } from './components/QrTrackingLayout';
import { Feedback } from './components/Feedback';

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
          { path: "tracking/:busId", Component: LiveTracking },
          { path: "fleet", Component: FleetManagement },
          { path: "analytics", Component: Analytics },
          { path: "reports", Component: Reports },
          { path: "lostandfound", Component: LostAndFound },
        ],
      },
      {
        path: "conductor",
        Component: ConductorLayout,
        children: [{ index: true, Component: ConductorPortal }],
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
        path: 'bus/track/:busId',
        Component: QrTrackingLayout,
        children: [
          { index: true, Component: BusInfoPublicPage },
          { path: 'lostandfound', Component: LostAndFoundView },
          { path: 'feedback', Component: Feedback }
        ]
      }
    ],
  },
]);
