import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Hook para usuarios
export const useUsers = () => {
  const createUser = useMutation(api.users.createUser);
  const updateOnlineStatus = useMutation(api.users.updateOnlineStatus);
  const updateUserLocation = useMutation(api.users.updateUserLocation);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const getUserById = (userId: Id<"users">) => 
    useQuery(api.users.getUserById, { userId });

  const getUserByEmail = (email: string) => 
    useQuery(api.users.getUserByEmail, { email });

  const getOnlineUsers = () => 
    useQuery(api.users.getOnlineUsers);

  const getUsersByLocation = (city: string, country: string, userType?: "client" | "handyman") =>
    useQuery(api.users.getUsersByLocation, { city, country, userType });

  return {
    // Mutations
    createUser,
    updateOnlineStatus,
    updateUserLocation,
    updateUserProfile,
    
    // Queries
    getUserById,
    getUserByEmail,
    getOnlineUsers,
    getUsersByLocation,
  };
};

// Hook para trabajos
export const useJobs = () => {
  const createJob = useMutation(api.jobs.createJob);
  const assignJob = useMutation(api.jobs.assignJob);
  const updateJobStatus = useMutation(api.jobs.updateJobStatus);

  const getJobById = (jobId: Id<"jobs">) =>
    useQuery(api.jobs.getJobById, { jobId });

  const getAvailableJobs = (filters?: {
    city?: string;
    country?: string;
    category?: string;
    urgency?: "low" | "medium" | "high" | "urgent";
    limit?: number;
  }) => useQuery(api.jobs.getAvailableJobs, filters || {});

  const getFlashJobs = (filters?: {
    city?: string;
    country?: string;
    limit?: number;
  }) => useQuery(api.jobs.getFlashJobs, filters || {});

  const getJobsByClient = (clientId: Id<"users">, status?: "open" | "in_progress" | "completed" | "cancelled") =>
    useQuery(api.jobs.getJobsByClient, { clientId, status });

  const getJobsByHandyman = (handymanId: Id<"users">, status?: "in_progress" | "completed") =>
    useQuery(api.jobs.getJobsByHandyman, { handymanId, status });

  const searchJobs = (searchText: string, filters?: {
    city?: string;
    country?: string;
    limit?: number;
  }) => useQuery(api.jobs.searchJobs, { searchText, ...filters });

  return {
    // Mutations
    createJob,
    assignJob,
    updateJobStatus,
    
    // Queries
    getJobById,
    getAvailableJobs,
    getFlashJobs,
    getJobsByClient,
    getJobsByHandyman,
    searchJobs,
  };
};

// Hook para mensajes y chat
export const useMessages = () => {
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const sendMessage = useMutation(api.messages.sendMessage);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);
  const markConversationAsRead = useMutation(api.messages.markConversationAsRead);

  const getMessages = (conversationId: Id<"conversations">, options?: {
    limit?: number;
    before?: number;
  }) => useQuery(api.messages.getMessages, { conversationId, ...options });

  const getUserConversations = (userId: Id<"users">, limit?: number) =>
    useQuery(api.messages.getUserConversations, { userId, limit });

  const getUnreadCount = (userId: Id<"users">) =>
    useQuery(api.messages.getUnreadCount, { userId });

  return {
    // Mutations
    getOrCreateConversation,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    
    // Queries
    getMessages,
    getUserConversations,
    getUnreadCount,
  };
};

// Hook combinado para facilidad de uso
export const useConvexData = () => {
  const users = useUsers();
  const jobs = useJobs();
  const messages = useMessages();

  return {
    users,
    jobs,
    messages,
  };
};

export default useConvexData;