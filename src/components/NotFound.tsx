import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 mx-auto text-red-500 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/admin')} variant="outline">
            Admin Portal
          </Button>
          <Button onClick={() => navigate('/conductor')} variant="outline">
            Conductor Portal
          </Button>
          <Button onClick={() => navigate('/passenger')}>Passenger Portal</Button>
        </div>
      </div>
    </div>
  );
}
