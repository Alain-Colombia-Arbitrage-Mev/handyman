# 🚀 Modern State Management with Zustand

This document describes the comprehensive state management system implemented for the Parkiing/Handyman Auction mobile app using **Zustand**, **AsyncStorage**, and **MMKV** for optimal performance and developer experience.

## 📋 Overview

The new state management system provides:

- ✅ **Type-safe** state management with TypeScript
- ✅ **Persistent** state across app restarts
- ✅ **Real-time** synchronization with Convex backend
- ✅ **Offline-first** architecture with automatic sync
- ✅ **Performance optimized** with MMKV storage
- ✅ **Modular** architecture with separate slices
- ✅ **Developer-friendly** with easy-to-use hooks

## 🏗️ Architecture

### Store Structure

```
src/store/
├── index.ts                 # Main store configuration
├── types.ts                # Type definitions
├── storage.ts              # Storage utilities
├── slices/                 # Store slices
│   ├── authSlice.ts        # Authentication state
│   ├── jobsSlice.ts        # Jobs and proposals
│   ├── notificationsSlice.ts # Notifications
│   ├── messagesSlice.ts    # Messages and conversations
│   ├── locationSlice.ts    # Geolocation
│   ├── settingsSlice.ts    # App settings
│   └── uiSlice.ts          # UI state (modals, loading, etc.)
└── integrations/           # Service integrations
    ├── convexIntegration.ts # Convex backend integration
    └── socketIntegration.ts # Socket.io real-time features
```

### Key Features

1. **Multi-layer Storage**:
   - MMKV for high-performance storage
   - AsyncStorage as fallback
   - Automatic encryption and compression

2. **State Persistence**:
   - Critical data persisted automatically
   - Smart hydration on app start
   - Migration support for schema changes

3. **Real-time Updates**:
   - Convex subscriptions for live data
   - Socket.io for instant messaging
   - Optimistic updates for better UX

4. **Connectivity Awareness**:
   - Automatic sync when online
   - Offline queue for pending operations
   - Network status monitoring

## 🔧 Usage

### Authentication

```typescript
import { useAuth } from '@/store';

function LoginScreen() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is now logged in, state is automatically persisted
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome {user?.name}!</Text>
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
}
```

### Jobs Management

```typescript
import { useJobs } from '@/store';

function JobsScreen() {
  const {
    jobs,
    fetchJobs,
    createJob,
    favorites,
    addToFavorites
  } = useJobs();

  useEffect(() => {
    fetchJobs(); // Automatically handles caching and sync
  }, []);

  const handleCreateJob = async (jobData) => {
    try {
      const jobId = await createJob(jobData);
      // Job created and synced to backend
    } catch (error) {
      // Handle error
    }
  };

  return (
    <FlatList
      data={jobs}
      renderItem={({ item }) => (
        <JobCard
          job={item}
          isFavorite={favorites.includes(item.id)}
          onFavorite={() => addToFavorites(item.id)}
        />
      )}
    />
  );
}
```

### Notifications

```typescript
import { useNotifications } from '@/store';

function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => markAsRead(item.id)}
          />
        )}
      />
    </View>
  );
}
```

### Settings & Preferences

```typescript
import { useSettings } from '@/store';

function SettingsScreen() {
  const { settings, setLanguage, setCurrency, toggleNotification } = useSettings();

  return (
    <View>
      <Text>Language: {settings.language}</Text>
      <Button
        title="Switch to English"
        onPress={() => setLanguage('en')}
      />

      <Switch
        value={settings.notifications.push}
        onValueChange={() => toggleNotification('push')}
      />
    </View>
  );
}
```

### Location Services

```typescript
import { useLocation } from '@/store';

function MapScreen() {
  const {
    currentLocation,
    getCurrentLocation,
    calculateDistance,
    locationLoading
  } = useLocation();

  const refreshLocation = async () => {
    const location = await getCurrentLocation(true); // Force refresh
    if (location) {
      console.log('Current location:', location);
    }
  };

  const distanceToJob = (job) => {
    return calculateDistance(job.location);
  };

  return (
    <View>
      {locationLoading ? (
        <ActivityIndicator />
      ) : (
        <MapView
          initialRegion={{
            latitude: currentLocation?.lat || 0,
            longitude: currentLocation?.lng || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      )}
    </View>
  );
}
```

### UI State Management

```typescript
import { useUI } from '@/store';

function AppScreen() {
  const {
    ui,
    setLoading,
    openModal,
    closeModal,
    setError
  } = useUI();

  const handleLongOperation = async () => {
    try {
      setLoading(true, 'Processing...');
      await someAsyncOperation();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {ui.isLoading && (
        <LoadingOverlay message={ui.loadingMessage} />
      )}

      {ui.error && (
        <ErrorBanner
          message={ui.error}
          onDismiss={() => setError(null)}
        />
      )}

      <Modal
        visible={ui.modals.settings}
        onRequestClose={() => closeModal('settings')}
      >
        <SettingsScreen />
      </Modal>
    </View>
  );
}
```

### Real-time Messages

```typescript
import { useMessages } from '@/store';

function ChatScreen({ conversationId }) {
  const {
    messages,
    sendMessage,
    fetchMessages,
    typingUsers
  } = useMessages();

  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  const handleSendMessage = async (text) => {
    await sendMessage({
      conversationId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: text,
      messageType: 'text',
      isRead: false,
    });
  };

  return (
    <View>
      <FlatList
        data={conversationMessages}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      {typingUsers[conversationId]?.length > 0 && (
        <TypingIndicator users={typingUsers[conversationId]} />
      )}

      <MessageInput onSend={handleSendMessage} />
    </View>
  );
}
```

## 🔄 State Synchronization

### Automatic Sync

The store automatically syncs with the backend when:
- User logs in
- App becomes active (foreground)
- Network connectivity is restored
- Manual sync is triggered

### Optimistic Updates

For better UX, many operations use optimistic updates:

```typescript
// Example: Adding to favorites
const addToFavorites = async (jobId: string) => {
  // 1. Update UI immediately (optimistic)
  set(state => {
    state.favorites.push(jobId);
  });

  try {
    // 2. Sync with backend
    await api.addToFavorites(jobId);
  } catch (error) {
    // 3. Revert on error
    set(state => {
      state.favorites = state.favorites.filter(id => id !== jobId);
    });
    throw error;
  }
};
```

### Offline Support

The store handles offline scenarios gracefully:

- **Read operations**: Served from cache
- **Write operations**: Queued for later sync
- **Real-time features**: Degraded gracefully
- **Error handling**: User-friendly offline messages

## 🔧 Configuration

### Storage Configuration

```typescript
// src/store/storage.ts
export const storageConfig = {
  // High-performance encrypted storage
  primaryStorage: MMKV,

  // Fallback for compatibility
  fallbackStorage: AsyncStorage,

  // Encryption key (use secure key management in production)
  encryptionKey: process.env.STORAGE_ENCRYPTION_KEY,

  // Cache TTL settings
  cacheTTL: {
    jobs: 30 * 60 * 1000,      // 30 minutes
    notifications: 60 * 60 * 1000,  // 1 hour
    messages: 24 * 60 * 60 * 1000,  // 24 hours
  },
};
```

### Persistence Configuration

```typescript
// What gets persisted
const persistConfig = {
  // Critical data - always persisted
  whitelist: [
    'isAuthenticated',
    'user',
    'settings',
    'favorites',
    'activeFilters'
  ],

  // Sensitive data - cleared on logout
  blacklist: [
    'token',
    'refreshToken',
    'temporaryState'
  ],
};
```

## 🧪 Testing

The new state management includes comprehensive testing utilities:

### Testing Individual Slices

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '@/store';

test('should login successfully', async () => {
  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.login({
      email: 'test@example.com',
      password: 'password'
    });
  });

  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).toBeDefined();
});
```

### Testing Store Integration

```typescript
import { useAppStore } from '@/store';

test('should sync data after login', async () => {
  const store = useAppStore.getState();

  await store.login({ email: 'test@example.com', password: 'password' });
  await store.sync();

  expect(store.jobs.length).toBeGreaterThan(0);
  expect(store.notifications.length).toBeGreaterThan(0);
});
```

## 🚀 Performance Optimizations

### 1. Selective Subscriptions

Only subscribe to the data you need:

```typescript
// ❌ Bad - subscribes to entire store
const store = useAppStore();

// ✅ Good - selective subscription
const { jobs, isLoading } = useJobs();
```

### 2. Computed Values

Use derived state for expensive calculations:

```typescript
const urgentJobs = useMemo(() =>
  jobs.filter(job => job.isUrgent),
  [jobs]
);
```

### 3. Batch Operations

Batch multiple state updates:

```typescript
useAppStore.setState((state) => {
  state.jobs = newJobs;
  state.favorites = newFavorites;
  state.ui.isLoading = false;
});
```

## 🔍 Debugging

### State Demo Component

The app includes a debug component (`StateDemo`) that shows:
- Current state of all slices
- Action buttons to test functionality
- Real-time state updates

Access it through the profile screen in development mode.

### Redux DevTools

Zustand integrates with Redux DevTools for debugging:

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    // ... store definition
    { name: 'parkiing-store' }
  )
);
```

### Logging

All store actions are logged with descriptive messages:

```
🔐 Login attempt for: user@example.com
✅ Login successful
📋 Fetching jobs with filters: { category: 'plomería' }
🔄 Syncing data with server...
```

## 🔐 Security Considerations

### Data Encryption

- Sensitive data encrypted with MMKV
- Tokens stored securely
- Biometric authentication support ready

### State Validation

- Runtime type checking with TypeScript
- Input validation on all actions
- Sanitization of user data

### Privacy

- Personal data marked and handled appropriately
- GDPR compliance considerations
- Data retention policies implemented

## 📱 Migration Guide

### From Old State Management

1. **Replace Context usage**:
   ```typescript
   // ❌ Old
   const { user } = useContext(AuthContext);

   // ✅ New
   const { user } = useAuth();
   ```

2. **Update state updates**:
   ```typescript
   // ❌ Old
   const [jobs, setJobs] = useState([]);

   // ✅ New
   const { jobs, fetchJobs } = useJobs();
   ```

3. **Replace manual persistence**:
   ```typescript
   // ❌ Old
   await AsyncStorage.setItem('user', JSON.stringify(user));

   // ✅ New - automatic persistence
   await login(credentials); // Automatically persisted
   ```

## 🎯 Best Practices

1. **Use specific hooks**: Import only what you need
2. **Handle loading states**: Always show loading indicators
3. **Error boundaries**: Wrap components with error boundaries
4. **Offline support**: Design for offline-first usage
5. **Type safety**: Leverage TypeScript for better DX
6. **Testing**: Write tests for critical user flows
7. **Performance**: Use memo and selective subscriptions

## 🔮 Future Enhancements

- [ ] Background sync with service workers
- [ ] Advanced caching strategies
- [ ] State analytics and monitoring
- [ ] A/B testing integration
- [ ] Performance monitoring
- [ ] Advanced error recovery
- [ ] State time-travel debugging

## 📚 Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [MMKV for React Native](https://github.com/mrousavy/react-native-mmkv)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

---

**The new state management system provides a solid foundation for scalable, maintainable, and performant mobile applications. It follows 2024 best practices and is ready for production use.**