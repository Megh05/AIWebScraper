import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UrlInput } from '@shared/schema';
import { ScrapeResult } from '../types/scraper';
import { apiRequest } from '@/lib/queryClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UrlInputForm from '../components/UrlInputForm';
import ScrapeResults from '../components/ScrapeResults';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const queryClient = useQueryClient();
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  
  // Query for getting scrape results
  const {
    data,
    isLoading: isLoadingResults,
    error,
  } = useQuery<ScrapeResult>({
    queryKey: currentUrl ? [`/api/scrape/${currentUrl}`] : [],
    enabled: !!currentUrl,
  });
  
  // Mutation for scraping a website
  const mutation = useMutation({
    mutationFn: async (formData: UrlInput) => {
      const res = await apiRequest('POST', '/api/scrape', formData);
      return res.json();
    },
    onSuccess: (data: ScrapeResult) => {
      // Invalidate queries and update current URL
      queryClient.setQueryData([`/api/scrape/${data.url}`], data);
      setCurrentUrl(data.url);
    },
  });
  
  const handleScrape = (formData: UrlInput) => {
    setCurrentUrl(formData.url);
    mutation.mutate(formData);
  };
  
  const isLoading = isLoadingResults || mutation.isPending;
  const errorMessage = error 
    ? (error as Error).message 
    : mutation.error 
      ? (mutation.error as Error).message 
      : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UrlInputForm onSubmit={handleScrape} isLoading={isLoading} />
        
        {isLoading || errorMessage || data ? (
          <ScrapeResults 
            isLoading={isLoading} 
            error={errorMessage} 
            data={data || null} 
          />
        ) : (
          <EmptyState />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
