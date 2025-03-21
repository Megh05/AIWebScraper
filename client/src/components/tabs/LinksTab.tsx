import { useState } from 'react';
import { Link } from '../../types/scraper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LinksTabProps {
  links: Link[];
}

type LinkFilter = 'all' | 'internal' | 'external';

export default function LinksTab({ links }: LinksTabProps) {
  const [filter, setFilter] = useState<LinkFilter>('all');
  
  // Apply filtering
  const filteredLinks = filter === 'all' 
    ? links 
    : links.filter(link => link.type === filter);
  
  // Calculate statistics
  const totalLinks = links.length;
  const internalLinks = links.filter(link => link.type === 'internal').length;
  const externalLinks = links.filter(link => link.type === 'external').length;
  
  // Calculate unique domains
  const domains = new Set();
  links.forEach(link => {
    if (link.url.startsWith('http')) {
      try {
        const url = new URL(link.url);
        domains.add(url.hostname);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });
  const uniqueDomains = domains.size;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Links Analysis</CardTitle>
        <CardDescription>All links extracted from the website.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Found Links</h4>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">Filter:</span>
            <Select value={filter} onValueChange={(value) => setFilter(value as LinkFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter links" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="internal">Internal Links</SelectItem>
                <SelectItem value="external">External Links</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredLinks.length > 0 ? (
          <div className="bg-gray-50 rounded-md mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLinks.map((link, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 truncate max-w-xs">{link.url}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.text || '(No text)'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          link.type === 'internal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {link.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md mb-6">
            <p className="text-gray-500">No links found matching the current filter.</p>
          </div>
        )}
        
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Link Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Total Links</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{totalLinks}</dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Internal Links</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{internalLinks}</dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">External Links</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{externalLinks}</dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Unique Domains</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{uniqueDomains}</dd>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
