import { ScrapeResult } from '../../types/scraper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JsonTabProps {
  data: ScrapeResult;
  onCopy: () => void;
}

export default function JsonTab({ data, onCopy }: JsonTabProps) {
  // Create a cleaned version without rawHtml for display
  const displayData = { ...data };
  delete (displayData as any).rawHtml;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Raw JSON Data</CardTitle>
        <CardDescription>The complete extracted data in JSON format.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy JSON
          </Button>
        </div>
        <div className="bg-gray-800 rounded-md overflow-auto max-h-[500px]">
          <pre className="text-xs font-mono text-gray-300 p-4 whitespace-pre">
            {JSON.stringify(displayData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
