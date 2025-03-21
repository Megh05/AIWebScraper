import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { urlInputSchema, type UrlInput } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UrlInputFormProps {
  onSubmit: (data: UrlInput) => void;
  isLoading: boolean;
}

export default function UrlInputForm({ onSubmit, isLoading }: UrlInputFormProps) {
  const [useOpenAI, setUseOpenAI] = useState(false);
  
  const form = useForm<UrlInput>({
    resolver: zodResolver(urlInputSchema),
    defaultValues: {
      url: '',
      parseImages: true,
      parseLinks: true,
      parseMetadata: true,
      parseText: true,
      useOpenAI: false,
      openAIKey: '',
    },
  });

  const handleSubmit = (data: UrlInput) => {
    onSubmit(data);
  };
  
  const handleAIToggle = (checked: boolean) => {
    setUseOpenAI(checked);
    form.setValue('useOpenAI', checked);
    if (!checked) {
      form.setValue('openAIKey', '');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">Extract Data from Any Website</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="py-5 px-4"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    className="ml-3 px-6" 
                    size="lg"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Scraping...' : 'Scrape Website'}</span>
                    {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                    {isLoading && (
                      <svg className="ml-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">Enter the complete URL including https://</p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* AI Analysis Option */}
          <div className="mb-4 p-4 border rounded-md bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                <h3 className="font-medium">AI Enhancement</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-1">
                        <Info className="h-4 w-4 text-slate-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Analyze website content with AI. Using OpenAI requires your own API key. The free local analyzer is available to all users.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormField
                control={form.control}
                name="useOpenAI"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormLabel className="text-sm mr-2">Use OpenAI</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleAIToggle(checked);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {useOpenAI && (
              <FormField
                control={form.control}
                name="openAIKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your OpenAI API key"
                        {...field}
                        type="password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500 mt-1">Your API key is sent securely and never stored.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {!useOpenAI && (
              <div className="text-sm text-slate-600">
                Using free local AI analyzer. For more advanced analysis, enable OpenAI.
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <FormField
              control={form.control}
              name="parseImages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Extract images</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parseLinks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Extract links</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parseMetadata"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Extract metadata</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parseText"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Extract text content</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
