import { Package, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ITEM_CATEGORIES } from "../../constants/conductor";
import { LostItem } from "../../types/conductor";

interface LostItemFormModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onReportItem: (item: LostItem) => Promise<boolean>;
}

export function LostItemFormModal({ isOpen, isLoading, onClose, onReportItem }: LostItemFormModalProps) {
  const [item, setItem] = useState<LostItem>({
    itemName: "",
    description: "",
    category: "other",
    location: "",
  });

  const handleSubmit = async () => {
    const success = await onReportItem(item);
    if (success) {
      // Reset form
      setItem({
        itemName: "",
        description: "",
        category: "other",
        location: "",
      });
      onClose();
    }
  };

  const isFormValid = item.itemName.trim() && item.description.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Report Lost Item</h3>
              <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => setItem({ ...item, itemName: e.target.value })}
                  placeholder="e.g. Black Backpack"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                  placeholder="Detailed description of the item"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select
                  value={item.category}
                  onChange={(e) => setItem({ ...item, category: e.target.value })}
                  className="cursor-pointer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                >
                  {ITEM_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Location Found</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => setItem({ ...item, location: e.target.value })}
                  placeholder="e.g. Under seat near back door"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reporting...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Report Item
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
