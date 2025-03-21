import { Zap } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center">
      <Zap className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No website data yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Enter a website URL in the form above to begin scraping.
      </p>
    </div>
  );
}
