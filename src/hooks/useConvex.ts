import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Hook para usuarios
export const useUsers = () => {
  const createUser = useMutation(api.users.createUser);

  const getUser = (userId: Id<"users">) => 
    useQuery(api.users.getUser, { userId });

  const getUserByEmail = (email: string) => 
    useQuery(api.users.getUserByEmail, { email });

  return {
    // Mutations
    createUser,
    
    // Queries
    getUser,
    getUserByEmail,
  };
};

// Hook para trabajos
export const useJobs = () => {
  const createJob = useMutation(api.jobs.createJob);

  const getJob = (jobId: Id<"jobs">) =>
    useQuery(api.jobs.getJob, { jobId });

  const getJobs = (filters?: {
    status?: string;
    category?: string;
    limit?: number;
  }) => useQuery(api.jobs.getJobs, filters || {});

  return {
    // Mutations
    createJob,
    
    // Queries
    getJob,
    getJobs,
  };
};

// Hook combinado para facilidad de uso
export const useConvexData = () => {
  const users = useUsers();
  const jobs = useJobs();

  return {
    users,
    jobs,
  };
};

export default useConvexData;