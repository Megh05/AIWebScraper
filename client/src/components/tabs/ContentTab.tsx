import { Content } from '../../types/scraper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ContentTabProps {
  content: Content;
}

export default function ContentTab({ content }: ContentTabProps) {
  const { headings, paragraphs, stats } = content;

  const formatReadingTime = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    return `${Math.round(minutes)} min${minutes === 1 ? '' : 's'}`;
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Content Analysis</CardTitle>
        <CardDescription>Main text and content extracted from the website.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        {headings && headings.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Heading Structure</h4>
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <ul className="space-y-2">
                {headings.map((heading, index) => (
                  <li 
                    key={index} 
                    className={`${heading.level === 1 ? 'text-base font-semibold' : 'text-sm'}`}
                    style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
                  >
                    {`H${heading.level}: ${heading.text}`}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        {paragraphs && paragraphs.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Main Content</h4>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-gray-700">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </>
        )}
        
        {stats && (
          <div className="px-0 py-5 border-t border-gray-200 mt-5">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Content Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-md p-4">
                <dt className="text-sm font-medium text-gray-500">Word Count</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">{stats.wordCount}</dd>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <dt className="text-sm font-medium text-gray-500">Paragraph Count</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">{stats.paragraphCount}</dd>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <dt className="text-sm font-medium text-gray-500">Average Reading Time</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">{formatReadingTime(stats.readingTimeMinutes)}</dd>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <dt className="text-sm font-medium text-gray-500">Heading Count</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">{stats.headingCount}</dd>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
