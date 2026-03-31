import { AlertCircle, Check, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { busAPI } from '../utils/api';
import { seedDatabase } from '../utils/seedDatabase';

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeeder, setShowSeeder] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    checkForData();
  }, []);

  const checkForData = async () => {
    try {
      const response = await busAPI.getAll();
      const buses = response.data || [];

      if (buses.length === 0) {
        setShowSeeder(true);
      } else {
        setHasData(true);
      }
    } catch (error) {
      // If fetch fails, show the seeder - might be first time setup
      setShowSeeder(true);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const success = await seedDatabase();
      if (success) {
        toast.success('Database seeded successfully! Please refresh the page.');
        setHasData(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('Failed to seed database. Please try again.');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      toast.error('Error seeding database. Please check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!showSeeder || hasData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200 max-w-md w-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 text-lg font-bold mb-1">Welcome to Fleet Management</h3>
            <p className="text-gray-600 text-sm">Let's set up your database</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-1">Database is empty</p>
              <p className="text-xs">Click below to populate with sample data including:</p>
              <ul className="text-xs mt-2 space-y-1 ml-4 list-disc">
                <li>4 sample buses with different routes</li>
                <li>3 routes with stops and fare information</li>
                <li>4 lost & found items</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSeeder(false)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Seed Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
