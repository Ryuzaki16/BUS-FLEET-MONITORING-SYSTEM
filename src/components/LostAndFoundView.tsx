import { Calendar, MapPin, Package, Phone, Search, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LostAndFoundItem } from '../types'
import { lostItemAPI } from '../utils/api'

export function LostAndFoundView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | LostAndFoundItem['category']>('all')
  const [selectedItem, setSelectedItem] = useState<LostAndFoundItem | null>(null)
  const [items, setItems] = useState<LostAndFoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadItems()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadItems()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadItems = async () => {
    try {
      const response = await lostItemAPI.getAll()
      const itemsData = response.data || []

      // Convert date strings to Date objects
      const formattedItems = itemsData.map((item: any) => ({
        ...item,
        dateFound: new Date(item.dateFound),
        claimedDate: item.claimedDate ? new Date(item.claimedDate) : undefined,
      }))

      setItems(formattedItems)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading lost items:', error)
      // Don't show error on initial load
      if (items.length > 0) {
        toast.error('Failed to refresh lost items')
      }
      setIsLoading(false)
    }
  }

  // Only show unclaimed items to passengers
  const unclaimedItems = items.filter((item) => item.status === 'unclaimed')

  const filteredItems = unclaimedItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: LostAndFoundItem['category']) => {
    const icons = {
      electronics: '📱',
      bag: '🎒',
      clothing: '👕',
      documents: '📄',
      accessories: '👜',
      other: '📦',
    }
    return icons[category]
  }

  const getDaysAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Lost & Found</h1>
              <p className="text-gray-600">Check if your lost item has been found</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              <strong>Lost something?</strong> Browse through the items found by our drivers and conductors. If you find
              your item, contact the terminal office or the listed contact person to claim it.
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
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
                placeholder="Search for your lost item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="electronics">📱 Electronics</option>
              <option value="bag">🎒 Bags</option>
              <option value="clothing">👕 Clothing</option>
              <option value="documents">📄 Documents</option>
              <option value="accessories">👜 Accessories</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/90 text-sm">Currently Available</p>
              <p className="text-3xl">{unclaimedItems.length} Items</p>
            </div>
            <Package className="w-12 h-12 text-white/30" />
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
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="p-4">
                  {/* Item Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1">
                      <h3 className="text-gray-900">{item.itemName}</h3>
                      <p className="text-gray-500 text-xs capitalize">{item.category}</p>
                      <p className="text-blue-600 text-xs mt-1">{getDaysAgo(item.dateFound)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Quick Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{item.dateFound.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{item.busPlateNumber}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="cursor-pointer w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No items found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No lost items have been reported yet'}
            </p>
          </motion.div>
        )}

        {/* Item Details Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{getCategoryIcon(selectedItem.category)}</div>
                    <div className="flex-1">
                      <h2 className="text-gray-900">{selectedItem.itemName}</h2>
                      <p className="text-gray-500 capitalize">{selectedItem.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedItem.description}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Date Found</p>
                        <p className="text-gray-900">
                          {selectedItem.dateFound.toLocaleDateString()} ({getDaysAgo(selectedItem.dateFound)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Bus & Route</p>
                        <p className="text-gray-900">{selectedItem.busPlateNumber}</p>
                        <p className="text-gray-600 text-sm">{selectedItem.route}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Found By</p>
                        <p className="text-gray-900">{selectedItem.foundBy}</p>
                      </div>
                    </div>

                    {selectedItem.location && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Package className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-gray-500 text-xs">Location in Bus</p>
                          <p className="text-gray-900">{selectedItem.location}</p>
                        </div>
                      </div>
                    )}

                    {selectedItem.contactInfo && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-blue-700 text-xs">Contact Information</p>
                          <p className="text-blue-900">{selectedItem.contactInfo}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* How to Claim */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="text-gray-900 mb-2">How to Claim This Item</h3>
                    <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                      <li>Visit the terminal office during office hours (8 AM - 5 PM)</li>
                      <li>Bring a valid ID for verification</li>
                      <li>Provide proof of ownership or describe the item in detail</li>
                      <li>If contact info is provided, you may call ahead to confirm</li>
                    </ol>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
