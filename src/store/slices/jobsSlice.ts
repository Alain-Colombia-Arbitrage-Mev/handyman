import { StateCreator } from 'zustand';
import { Job, JobProposal, JobsActions, UIState } from '../types';
import storageUtils, { STORAGE_KEYS } from '../storage';

export interface JobsSlice extends JobsActions {
  jobs: Job[];
  proposals: JobProposal[];
  favorites: string[];
}

export const createJobsSlice: StateCreator<
  JobsSlice,
  [],
  [],
  JobsSlice
> = (set, get) => ({
  // Initial state
  jobs: [],
  proposals: [],
  favorites: [],

  // Actions
  fetchJobs: async (filters?: Partial<UIState['activeFilters']>) => {
    try {
      console.log('📋 Fetching jobs with filters:', filters);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock jobs data
      const mockJobs: Job[] = [
        {
          id: 'job-1',
          title: 'Reparación de plomería urgente',
          description: 'Se necesita plomero para reparar fuga en baño principal. Hay agua acumulada y necesita atención inmediata.',
          category: 'plomería',
          budget: {
            min: 150,
            max: 300,
            currency: 'USD'
          },
          clientId: 'client-1',
          status: 'open',
          location: {
            lat: 4.6120,
            lng: -74.0784,
            address: 'Chapinero, Bogotá'
          },
          isUrgent: true,
          deadline: Date.now() + 6 * 60 * 60 * 1000, // 6 hours
          createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          updatedAt: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: 'job-2',
          title: 'Instalación de aire acondicionado',
          description: 'Instalación de aire acondicionado en apartamento. Se tiene el equipo, solo se necesita la instalación profesional.',
          category: 'electricidad',
          budget: {
            min: 200,
            max: 400,
            currency: 'USD'
          },
          clientId: 'client-2',
          status: 'open',
          location: {
            lat: 4.6390,
            lng: -74.0933,
            address: 'Zona Rosa, Bogotá'
          },
          isUrgent: false,
          deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
          createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          updatedAt: Date.now() - 4 * 60 * 60 * 1000,
        },
        {
          id: 'job-3',
          title: 'Pintura de apartamento completo',
          description: 'Pintura completa de apartamento de 80m2. Incluye paredes y techos. Se proporciona la pintura.',
          category: 'pintura',
          budget: {
            min: 500,
            max: 800,
            currency: 'USD'
          },
          clientId: 'client-3',
          status: 'open',
          location: {
            lat: 4.5981,
            lng: -74.0758,
            address: 'La Candelaria, Bogotá'
          },
          isUrgent: false,
          deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
          createdAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
          updatedAt: Date.now() - 12 * 60 * 60 * 1000,
        },
        {
          id: 'job-4',
          title: 'Reparación de electrodomésticos',
          description: 'Lavadora no está funcionando correctamente. Hace ruidos extraños y no centrifuga bien.',
          category: 'electrodomésticos',
          budget: {
            min: 100,
            max: 250,
            currency: 'USD'
          },
          clientId: 'client-4',
          status: 'open',
          location: {
            lat: 4.6482,
            lng: -74.0630,
            address: 'Usaquén, Bogotá'
          },
          isUrgent: false,
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          updatedAt: Date.now() - 6 * 60 * 60 * 1000,
        },
        {
          id: 'job-5',
          title: 'Instalación de estanterías',
          description: 'Instalación de sistema de estanterías en oficina. Material ya comprado, solo se necesita instalación.',
          category: 'carpintería',
          budget: {
            min: 80,
            max: 150,
            currency: 'USD'
          },
          clientId: 'client-5',
          status: 'open',
          location: {
            lat: 4.6261,
            lng: -74.0692,
            address: 'Centro Internacional, Bogotá'
          },
          isUrgent: false,
          deadline: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days
          createdAt: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
          updatedAt: Date.now() - 8 * 60 * 60 * 1000,
        },
      ];

      // Apply filters if provided
      let filteredJobs = mockJobs;
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          filteredJobs = filteredJobs.filter(job => job.category === filters.category);
        }
        if (filters.jobType === 'urgent') {
          filteredJobs = filteredJobs.filter(job => job.isUrgent);
        }
        if (filters.priceRange) {
          filteredJobs = filteredJobs.filter(job =>
            job.budget.min >= filters.priceRange!.min &&
            job.budget.max <= filters.priceRange!.max
          );
        }
      }

      // Cache jobs
      await storageUtils.setJSON(STORAGE_KEYS.JOBS_CACHE, {
        data: filteredJobs,
        timestamp: Date.now(),
        filters
      });

      set({ jobs: filteredJobs });
      console.log(`✅ Fetched ${filteredJobs.length} jobs`);
    } catch (error) {
      console.error('❌ Failed to fetch jobs:', error);

      // Try to load from cache
      const cached = await storageUtils.getJSON<{
        data: Job[];
        timestamp: number;
        filters?: any;
      }>(STORAGE_KEYS.JOBS_CACHE);

      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 minutes
        set({ jobs: cached.data });
        console.log('📦 Loaded jobs from cache');
      }

      throw error;
    }
  },

  fetchJobById: async (id: string) => {
    try {
      console.log('🔍 Fetching job by ID:', id);

      // Check if job is already in state
      const { jobs } = get();
      const existingJob = jobs.find(job => job.id === id);
      if (existingJob) {
        return existingJob;
      }

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock job fetch
      const mockJob: Job = {
        id,
        title: 'Job fetched by ID',
        description: 'This is a job fetched by ID',
        category: 'general',
        budget: { min: 100, max: 200, currency: 'USD' },
        clientId: 'client-1',
        status: 'open',
        location: { lat: 4.6097, lng: -74.0817, address: 'Bogotá, Colombia' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add to jobs array if not exists
      set({ jobs: [...jobs, mockJob] });

      console.log('✅ Job fetched by ID successfully');
      return mockJob;
    } catch (error) {
      console.error('❌ Failed to fetch job by ID:', error);
      return null;
    }
  },

  createJob: async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('➕ Creating new job:', job.title);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newJob: Job = {
        ...job,
        id: `job-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { jobs } = get();
      set({ jobs: [newJob, ...jobs] });

      console.log('✅ Job created successfully');
      return newJob.id;
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    }
  },

  updateJob: async (id: string, updates: Partial<Job>) => {
    try {
      console.log('✏️ Updating job:', id);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { jobs } = get();
      const updatedJobs = jobs.map(job =>
        job.id === id
          ? { ...job, ...updates, updatedAt: Date.now() }
          : job
      );

      set({ jobs: updatedJobs });
      console.log('✅ Job updated successfully');
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      throw error;
    }
  },

  deleteJob: async (id: string) => {
    try {
      console.log('🗑️ Deleting job:', id);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { jobs } = get();
      const filteredJobs = jobs.filter(job => job.id !== id);

      set({ jobs: filteredJobs });
      console.log('✅ Job deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete job:', error);
      throw error;
    }
  },

  submitProposal: async (proposal: Omit<JobProposal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('📝 Submitting proposal for job:', proposal.jobId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const newProposal: JobProposal = {
        ...proposal,
        id: `proposal-${Date.now()}`,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { proposals } = get();
      set({ proposals: [newProposal, ...proposals] });

      console.log('✅ Proposal submitted successfully');
    } catch (error) {
      console.error('❌ Failed to submit proposal:', error);
      throw error;
    }
  },

  acceptProposal: async (proposalId: string) => {
    try {
      console.log('✅ Accepting proposal:', proposalId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { proposals } = get();
      const updatedProposals = proposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: 'accepted' as const, updatedAt: Date.now() }
          : proposal
      );

      set({ proposals: updatedProposals });
      console.log('✅ Proposal accepted successfully');
    } catch (error) {
      console.error('❌ Failed to accept proposal:', error);
      throw error;
    }
  },

  rejectProposal: async (proposalId: string) => {
    try {
      console.log('❌ Rejecting proposal:', proposalId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { proposals } = get();
      const updatedProposals = proposals.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: 'rejected' as const, updatedAt: Date.now() }
          : proposal
      );

      set({ proposals: updatedProposals });
      console.log('✅ Proposal rejected successfully');
    } catch (error) {
      console.error('❌ Failed to reject proposal:', error);
      throw error;
    }
  },

  markJobComplete: async (jobId: string) => {
    try {
      console.log('✅ Marking job as complete:', jobId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { jobs } = get();
      const updatedJobs = jobs.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'completed' as const,
              completedAt: Date.now(),
              updatedAt: Date.now()
            }
          : job
      );

      set({ jobs: updatedJobs });
      console.log('✅ Job marked as complete successfully');
    } catch (error) {
      console.error('❌ Failed to mark job as complete:', error);
      throw error;
    }
  },

  addToFavorites: async (jobId: string) => {
    try {
      console.log('⭐ Adding job to favorites:', jobId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const { favorites } = get();
      if (!favorites.includes(jobId)) {
        const updatedFavorites = [...favorites, jobId];
        set({ favorites: updatedFavorites });

        // Cache favorites
        await storageUtils.setJSON('favorites', updatedFavorites);
      }

      console.log('✅ Job added to favorites');
    } catch (error) {
      console.error('❌ Failed to add job to favorites:', error);
      throw error;
    }
  },

  removeFromFavorites: async (jobId: string) => {
    try {
      console.log('💔 Removing job from favorites:', jobId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const { favorites } = get();
      const updatedFavorites = favorites.filter(id => id !== jobId);
      set({ favorites: updatedFavorites });

      // Cache favorites
      await storageUtils.setJSON('favorites', updatedFavorites);

      console.log('✅ Job removed from favorites');
    } catch (error) {
      console.error('❌ Failed to remove job from favorites:', error);
      throw error;
    }
  },

  setJobs: (jobs: Job[]) => {
    set({ jobs });
  },

  setProposals: (proposals: JobProposal[]) => {
    set({ proposals });
  },

  setFavorites: (favorites: string[]) => {
    set({ favorites });
  },

  updateJobDistance: (jobId: string, distance: number) => {
    const { jobs } = get();
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, distance } : job
    );
    set({ jobs: updatedJobs });
  },
});