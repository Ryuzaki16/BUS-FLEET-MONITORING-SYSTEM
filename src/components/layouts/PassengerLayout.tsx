import { Outlet, useNavigate } from 'react-router';
import { Navbar } from '../Navbar';

export type PassengerPage = 'passenger' | 'lostandfound';

export default function PassengerLayout() {
  const navigate = useNavigate();

  const handleNavigate = (page: PassengerPage) => {
    if (page === 'passenger') {
      navigate('/passenger');
    } else {
      console.log(`Navigating to ${page}`);
      navigate(`/passenger/${page}`);
    }
  };


  return (
    <>
      <Navbar 
        onNavigate={handleNavigate}
        userRole="passenger"
      />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}
