import { Metadata } from '../../types/scraper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MetadataTabProps {
  metadata: Metadata;
}

export default function MetadataTab({ metadata }: MetadataTabProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Website Metadata</CardTitle>
        <CardDescription>Key information extracted from the website's HTML head.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Info</h4>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.title || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.description || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Canonical URL</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.canonical || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Language</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.language || 'Not specified'}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Social Media</h4>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Open Graph Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.openGraph?.title || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Open Graph Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.openGraph?.description || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Twitter Card</dt>
                <dd className="mt-1 text-sm text-gray-900">{metadata.twitter?.card || 'Not available'}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="px-0 py-5 border-t border-gray-200 mt-5">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Other Meta Tags</h4>
          <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre text-gray-700">
              {metadata.other ? JSON.stringify(metadata.other, null, 2) : 'No additional meta tags found'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
