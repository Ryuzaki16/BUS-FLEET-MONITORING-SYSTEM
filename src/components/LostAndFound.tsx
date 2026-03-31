import { Calendar, CheckCircle, MapPin, Package, Phone, Plus, Search, Trash2, User, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LostAndFoundItem } from '../types';
import { lostItemAPI } from '../utils/api';

export function LostAndFound() {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unclaimed' | 'claimed' | 'disposed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | LostAndFoundItem['category']>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LostAndFoundItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New item form state
  const [newItem, setNewItem] = useState({
    itemName: '',
    description: '',
    category: 'other' as LostAndFoundItem['category'],
    busPlateNumber: '',
    route: '',
    foundBy: '',
    location: '',
    contactInfo: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await lostItemAPI.getAll();
      const itemsData = response.data || [];

      // Convert date strings to Date objects
      const formattedItems = itemsData.map((item: any) => ({
        ...item,
        dateFound: new Date(item.dateFound),
        claimedDate: item.claimedDate ? new Date(item.claimedDate) : undefined,
      }));

      setItems(formattedItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading lost items:', error);
      // Don't show error on initial load
      if (items.length > 0) {
        toast.error('Failed to refresh lost items');
      }
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddItem = async () => {
    if (!newItem.itemName || !newItem.description || !newItem.busPlateNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const itemId = `lf_${Date.now()}`;
      await lostItemAPI.create({
        id: itemId,
        ...newItem,
      });

      await loadItems(); // Reload items from database
      setShowAddModal(false);
      resetForm();
      toast.success('Lost item added successfully!');
    } catch (error) {
      console.error('Error adding lost item:', error);
      toast.error('Failed to add lost item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: LostAndFoundItem['status']) => {
    setIsLoading(true);
    try {
      const updateData: any = { status };
      if (status === 'claimed') {
        updateData.claimedDate = new Date().toISOString();
      }

      await lostItemAPI.update(id, updateData);
      await loadItems(); // Reload items from database
      toast.success(`Item marked as ${status}!`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsLoading(true);
    try {
      await lostItemAPI.delete(id);
      await loadItems(); // Reload items from database
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewItem({
      itemName: '',
      description: '',
      category: 'other',
      busPlateNumber: '',
      route: '',
      foundBy: '',
      location: '',
      contactInfo: '',
    });
  };

  const getCategoryIcon = (category: LostAndFoundItem['category']) => {
    const icons = {
      electronics: '📱',
      bag: '🎒',
      clothing: '👕',
      documents: '📄',
      accessories: '👜',
      other: '📦',
    };
    return icons[category];
  };

  const getStatusColor = (status: LostAndFoundItem['status']) => {
    const colors = {
      unclaimed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      claimed: 'bg-green-100 text-green-700 border-green-200',
      disposed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Lost & Found</h1>
              <p className="text-gray-600">Manage lost items and help passengers recover their belongings</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-gray-900 text-2xl">{items.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unclaimed</p>
                <p className="text-yellow-600 text-2xl">{items.filter((i) => i.status === 'unclaimed').length}</p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Claimed</p>
                <p className="text-green-600 text-2xl">{items.filter((i) => i.status === 'claimed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setShowAddModal(true)}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-sm">Add New Item</p>
                <p className="text-xl">Report Found Item</p>
              </div>
              <Plus className="w-8 h-8" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="unclaimed">Unclaimed</option>
              <option value="claimed">Claimed</option>
              <option value="disposed">Disposed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="bag">Bags</option>
              <option value="clothing">Clothing</option>
              <option value="documents">Documents</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>
        </motion.div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, y: 16, scale: 0.96 }}
                transition={{
                  delay: index * 0.001,
                  duration: 0.1,
                  ease: [0.1, 0.8, 0.25, 1], // smoother cubic-bezier
                }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                      <div>
                        <h3 className="text-gray-900">{item.itemName}</h3>
                        <p className="text-gray-500 text-xs">{item.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{item.dateFound.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {item.busPlateNumber} - {item.route}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Found by: {item.foundBy}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.location}</span>
                      </div>
                    )}
                    {item.contactInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.contactInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {item.status === 'unclaimed' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'claimed')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Mark Claimed
                      </button>
                    )}
                    {item.status !== 'disposed' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'disposed')}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Dispose
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No items found</p>
          </motion.div>
        )}

        {/* Add Item Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900">Add Lost & Found Item</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Item Name */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Item Name</label>
                      <input
                        type="text"
                        value={newItem.itemName}
                        onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Samsung Phone, Blue Backpack"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Description</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Detailed description of the item..."
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Category</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="electronics">Electronics</option>
                        <option value="bag">Bag</option>
                        <option value="clothing">Clothing</option>
                        <option value="documents">Documents</option>
                        <option value="accessories">Accessories</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Bus & Route */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Bus Plate Number</label>
                        <input
                          type="text"
                          value={newItem.busPlateNumber}
                          onChange={(e) => setNewItem({ ...newItem, busPlateNumber: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ABC 1234"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Route</label>
                        <input
                          type="text"
                          value={newItem.route}
                          onChange={(e) => setNewItem({ ...newItem, route: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City Center - Terminal"
                        />
                      </div>
                    </div>

                    {/* Found By & Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Found By</label>
                        <input
                          type="text"
                          value={newItem.foundBy}
                          onChange={(e) => setNewItem({ ...newItem, foundBy: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Driver/Conductor name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Location in Bus</label>
                        <input
                          type="text"
                          value={newItem.location}
                          onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Under seat, Near door"
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Contact Info (Optional)</label>
                      <input
                        type="text"
                        value={newItem.contactInfo}
                        onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number or office location"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddItem}
                        disabled={!newItem.itemName || !newItem.description || !newItem.busPlateNumber}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
