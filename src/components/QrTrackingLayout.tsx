import { Outlet, useNavigate, useParams } from 'react-router';
import { Navbar } from './Navbar';
import { PassengerPage } from './layouts/PassengerLayout';

export function QrTrackingLayout() {
  const { busId } = useParams();
  const navigate = useNavigate();

  const handleNavigate = (page: PassengerPage) => {
    if (page === 'qr_tracking') {
      navigate(`/bus/track/${busId}`);
    } else if (page === 'lostandfound') {
      navigate(`/bus/track/${busId}/lostandfound`);
    } else {
      navigate(`/bus/track/${busId}/${page}?busId=${busId}`);
    }
  };

  return (
    <>
      <Navbar onNavigate={handleNavigate} userRole="qr_tracking" />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}