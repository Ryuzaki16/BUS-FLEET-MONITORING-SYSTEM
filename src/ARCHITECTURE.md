# Conductor Portal - Code Structure

## 📁 File Organization

```
/components/conductor/          # Conductor-specific components
  ├── ConductorPortal.tsx       # Main container component
  ├── BusSelectionScreen.tsx    # Bus number input screen
  ├── GPSPermissionModal.tsx    # GPS permission request modal
  ├── TripCard.tsx              # Trip status and control card
  ├── TripActions.tsx           # Action buttons (ticket, status, lost item)
  ├── PassengerList.tsx         # List of passengers with removal
  ├── TicketFormModal.tsx       # Ticket issuance form
  ├── StatusUpdateModal.tsx     # Bus status update modal
  └── LostItemFormModal.tsx     # Lost item report form

/hooks/                         # Custom React hooks
  ├── useGPSTracking.ts         # GPS tracking logic & permissions
  ├── useTripManagement.ts      # Trip CRUD operations
  └── useBusManagement.ts       # Bus selection & status

/types/                         # TypeScript type definitions
  ├── conductor.ts              # Conductor-specific types
  └── index.ts                  # Shared types

/constants/                     # Application constants
  └── conductor.ts              # Routes, fares, categories, configs

/utils/                         # Utility functions
  └── api.ts                    # API service layer
```

## 🎯 Architecture Principles

### 1. **Separation of Concerns**

- **Components**: Pure UI components with minimal logic
- **Hooks**: Reusable business logic and state management
- **Constants**: Configuration and static data
- **Types**: Type safety and intellisense

### 2. **Single Responsibility**

Each component/hook has one clear purpose:

- `TripCard` → Display trip status
- `useGPSTracking` → Handle GPS operations
- `useTripManagement` → Manage trip lifecycle

### 3. **Composition Over Inheritance**

Components are composed together rather than deeply nested:

```tsx
<ConductorPortal>
  <TripCard />
  <TripActions />
  <PassengerList />
</ConductorPortal>
```

### 4. **Custom Hooks for Logic**

Business logic is extracted into custom hooks:

- State management
- API calls
- Side effects
- Computed values

## 🔧 Key Custom Hooks

### `useGPSTracking(busId)`

Manages GPS tracking with `watchPosition` API

```tsx
const {
  isGranted, // Permission status
  currentLocation, // Current lat/lng
  requestPermission, // Request permission function
  stopTracking, // Stop tracking function
} = useGPSTracking(busId)
```

### `useTripManagement(busInfo)`

Handles trip lifecycle and passenger management

```tsx
const {
  isActive, // Trip status
  passengers, // Current passengers
  startTrip, // Start trip function
  endTrip, // End trip function
  addPassenger, // Add passenger function
  removePassenger, // Remove passenger function
  getTotalRevenue, // Calculate revenue
} = useTripManagement(busInfo)
```

### `useBusSelection()`

Manages bus validation and selection

```tsx
const {
  busInfo, // Selected bus info
  validateBus, // Validate bus number
  clearBus, // Clear selection
} = useBusSelection()
```

## 📝 Component Props Pattern

All components follow a consistent prop pattern:

```tsx
interface ComponentProps {
  // Data props
  data: DataType

  // State props
  isLoading: boolean
  isOpen: boolean

  // Callback props
  onAction: () => void
  onClose: () => void
}
```

## 🎨 Benefits of This Structure

### ✅ **Maintainability**

- Easy to locate and modify specific functionality
- Clear dependencies between modules
- Self-documenting code structure

### ✅ **Testability**

- Hooks can be tested independently
- Components are pure and predictable
- Mocked dependencies are simple

### ✅ **Reusability**

- Hooks can be used across different components
- Components can be reused in different contexts
- Constants prevent duplication

### ✅ **Scalability**

- New features added without touching existing code
- Easy to add new components/hooks
- Type safety prevents regression bugs

### ✅ **Developer Experience**

- TypeScript autocomplete works perfectly
- Easy to understand data flow
- Quick to onboard new developers

## 🔄 Data Flow

```
User Interaction
       ↓
   Component
       ↓
  Custom Hook (Business Logic)
       ↓
   API Layer
       ↓
    Backend
       ↓
  Update State
       ↓
  Re-render UI
```

## 🚀 Best Practices Applied

1. **DRY (Don't Repeat Yourself)**: Constants and hooks eliminate duplication
2. **KISS (Keep It Simple, Stupid)**: Each file has one clear purpose
3. **SOLID Principles**: Especially Single Responsibility and Dependency Inversion
4. **React Best Practices**: Hooks, composition, prop drilling avoidance
5. **TypeScript Best Practices**: Strong typing, interfaces, type inference

## 📚 Future Enhancements

Potential improvements to the structure:

- Add unit tests for hooks
- Implement error boundaries
- Add loading skeletons
- Implement optimistic updates
- Add state persistence layer
- Implement real-time WebSocket updates
