import { useState } from 'react';
import { ScrapeResult } from '../types/scraper';
import { downloadJson, downloadCsv, copyToClipboard } from '../utils/downloadUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MetadataTab from './tabs/MetadataTab';
import ContentTab from './tabs/ContentTab';
import LinksTab from './tabs/LinksTab';
import ImagesTab from './tabs/ImagesTab';
import JsonTab from './tabs/JsonTab';

interface ScrapeResultsProps {
  isLoading: boolean;
  error: string | null;
  data: ScrapeResult | null;
}

export default function ScrapeResults({ isLoading, error, data }: ScrapeResultsProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'content' | 'links' | 'images' | 'json'>('metadata');
  const { toast } = useToast();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Website Data</h3>
          <p className="text-gray-500 text-center max-w-md">
            Our AI is analyzing the website structure and extracting meaningful data. This may take a moment depending on the site's complexity.
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Return null if no data
  if (!data) {
    return null;
  }

  const handleDownloadJson = () => {
    downloadJson(data);
    toast({
      title: "Download Started",
      description: "Your JSON file is being downloaded",
    });
  };

  const handleDownloadCsv = () => {
    downloadCsv(data);
    toast({
      title: "Download Started",
      description: "Your CSV file is being downloaded",
    });
  };

  const handleCopyJson = () => {
    copyToClipboard(JSON.stringify(data, null, 2))
      .then(() => {
        toast({
          title: "Copied!",
          description: "JSON data copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Scraped Data Results</h2>
          <p className="text-sm text-gray-500">Scraped from: {data.url}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleDownloadJson}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metadata' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'links' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('links')}
          >
            Links
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'json' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('json')}
          >
            Raw JSON
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'metadata' && <MetadataTab metadata={data.metadata} />}
      {activeTab === 'content' && <ContentTab content={data.content} />}
      {activeTab === 'links' && <LinksTab links={data.links} />}
      {activeTab === 'images' && <ImagesTab images={data.images} />}
      {activeTab === 'json' && <JsonTab data={data} onCopy={handleCopyJson} />}
    </div>
  );
}
