import { Image } from '../../types/scraper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ImagesTabProps {
  images: Image[];
}

export default function ImagesTab({ images }: ImagesTabProps) {
  // Calculate image statistics
  const totalImages = images.length;
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '').length;
  
  // Calculate total size if available
  let totalSize = 0;
  let sizeCount = 0;
  images.forEach(img => {
    if (img.size) {
      totalSize += img.size;
      sizeCount++;
    }
  });
  
  const formatFileSize = (bytes: number | null): string => {
    if (bytes === null) return 'Unknown';
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Images Analysis</CardTitle>
        <CardDescription>All images extracted from the website.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Found Images</h4>
          <div>
            <span className="text-sm text-gray-500 mr-2">{totalImages} images found</span>
          </div>
        </div>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {images.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-md overflow-hidden border border-gray-200">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {/* Use URL validation to prevent broken images */}
                  {image.src && (image.src.startsWith('http') || image.src.startsWith('/')) ? (
                    <img 
                      src={image.src.startsWith('http') ? image.src : `https://via.placeholder.com/300x200?text=Image+${index+1}`} 
                      alt={image.alt || 'No alt text'} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/300x200?text=Error+Loading`;
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">Invalid image source</div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {image.src.split('/').pop() || 'Unknown filename'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {image.width && image.height 
                      ? `${image.width} × ${image.height}` 
                      : 'Dimensions unknown'} 
                    {image.size ? ` • ${formatFileSize(image.size)}` : ''} 
                    {image.type ? ` • ${image.type}` : ''}
                  </div>
                  <div className="text-xs font-mono text-gray-500 truncate mt-1">{image.src}</div>
                  <div className="text-xs text-gray-500 mt-2">Alt: "{image.alt || 'No alt text'}"</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md mb-6">
            <p className="text-gray-500">No images found on this page.</p>
          </div>
        )}
        
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Image Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Total Images</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{totalImages}</dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Images with Alt Text</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{imagesWithAlt}</dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Total Size</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {sizeCount > 0 ? formatFileSize(totalSize) : 'Unknown'}
            </dd>
          </div>
          <div className="bg-gray-50 rounded-md p-4">
            <dt className="text-sm font-medium text-gray-500">Average Size</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {sizeCount > 0 ? formatFileSize(totalSize / sizeCount) : 'Unknown'}
            </dd>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
