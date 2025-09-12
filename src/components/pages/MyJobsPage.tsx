import React from 'react';
import { Job } from '../../types';
import { JobCard } from '../JobCard';
import { Briefcase, Clock, CheckCircle } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface MyJobsPageProps {
  jobList: Job[];
  onJobClick: (job: Job) => void;
  onBackToProfile: () => void;
  onSetActiveTab: (tab: string) => void;
}

export function MyJobsPage({ jobList, onJobClick, onBackToProfile, onSetActiveTab }: MyJobsPageProps) {
  const { t } = useLanguage();
  
  // Filter jobs by current user (this should ideally come from auth context)
  const myJobs = jobList.filter(job => job.postedBy === t('mockData.users.jorgeMartinez'));
  const openJobs = myJobs.filter(job => job.status === 'open');
  const inProgressJobs = myJobs.filter(job => job.status === 'in_progress');
  const completedJobs = myJobs.filter(job => job.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.myJobs')} onBack={onBackToProfile} />

      <Tabs defaultValue="open" className="w-full">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="open" className="text-xs sm:text-sm px-2">
              {t('myJobs.tabs.open')} ({openJobs.length})
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm px-2">
              {t('myJobs.tabs.inProgress')} ({inProgressJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm px-2">
              {t('myJobs.tabs.completed')} ({completedJobs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="open" className="p-4 space-y-4">
          {openJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={onJobClick} />
          ))}
          {openJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={48} />
              <h3 className="font-medium text-gray-600 mb-2">{t('myJobs.empty.noOpenJobs')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('myJobs.empty.publishToReceiveOffers')}</p>
              <Button 
                onClick={() => onSetActiveTab('post')}
                className="touch-manipulation"
              >
                {t('myJobs.empty.publishJob')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="p-4 space-y-4">
          {inProgressJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={onJobClick} />
          ))}
          {inProgressJobs.length === 0 && (
            <div className="text-center py-12">
              <Clock size={48} />
              <h3 className="font-medium text-gray-600 mb-2">{t('myJobs.empty.noProgressJobs')}</h3>
              <p className="text-sm text-gray-500">{t('myJobs.empty.acceptedJobsAppearHere')}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="p-4 space-y-4">
          {completedJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={onJobClick} />
          ))}
          {completedJobs.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle size={48} />
              <h3 className="font-medium text-gray-600 mb-2">{t('myJobs.empty.noCompletedJobs')}</h3>
              <p className="text-sm text-gray-500">{t('myJobs.empty.finishedJobsAppearHere')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}