'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { issueCategories } from '@/lib/data';
import { useState, useTransition, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, MapPin, Mic, MicOff } from 'lucide-react';
import { getCategoryForImage, createIssue } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  location: z.string().min(3, { message: "Please provide a location." }),
  photoDataUri: z.string().optional(),
});

export function ReportForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const currentDescription = form.getValues('description');
        form.setValue('description', currentDescription + finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          toast({ variant: 'destructive', title: 'Speech Error', description: `An error occurred: ${event.error}` });
          setIsRecording(false);
      }
      
      recognition.onend = () => {
          if (isRecording) { // If it ends unexpectedly, stop our state
            setIsRecording(false);
          }
      };
      
      recognitionRef.current = recognition;
    } else {
        toast({ variant: 'destructive', title: 'Not Supported', description: 'Speech recognition is not supported in your browser.' });
    }
    
    return () => {
        recognitionRef.current?.stop();
    }
  }, [form, toast, isRecording]);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoDataUri', dataUri);
        setIsCategorizing(true);
        try {
          const result = await getCategoryForImage(dataUri);
          if (result.category) {
            const matchingCategory = issueCategories.find(cat => cat.toLowerCase().includes(result.category.toLowerCase()));
            if (matchingCategory) {
              form.setValue('category', matchingCategory);
              toast({ title: "Image Categorized!", description: `We think this is a "${matchingCategory}".` });
            } else {
               toast({ title: "Image Categorized!", description: `AI suggested: "${result.category}". Please select the closest match.` });
            }
          } else if(result.error) {
             toast({ variant: "destructive", title: "Categorization Failed", description: result.error });
          }
        } finally {
          setIsCategorizing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would reverse-geocode this to an address.
        const locString = `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`;
        form.setValue('location', locString);
        setIsLocating(false);
        toast({ title: "Location Found!", description: "Your current location has been added." });
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        toast({ variant: "destructive", title: "Location Error", description: "Could not get your location." });
      }
    );
  };
  
  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      try {
        await createIssue(data)
        toast({ title: "Report Submitted!", description: "Thank you for your contribution." });
      } catch (err) {
         toast({ variant: "destructive", title: "Submission Error", description: "Something went wrong." });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="photoDataUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Photo</FormLabel>
              <FormControl>
                <div className="relative flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Issue preview" fill objectFit="cover" className="rounded-lg" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera className="mx-auto h-8 w-8" />
                      <p>Click to upload or use camera</p>
                    </div>
                  )}
                  <Input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleImageChange}
                  />
                  {isCategorizing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Large pothole" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
               <div className="relative">
                 <FormControl>
                    <Textarea
                      placeholder="Tell us more about the issue, or use the microphone to speak."
                      className="resize-none pr-10"
                      {...field}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleMicClick}
                    disabled={!recognitionRef.current}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">Record description</span>
                  </Button>
               </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an issue category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {issueCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location / Address</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g., 123 Main St, near the park" {...field} />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleLocation} disabled={isLocating}>
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </div>
              <FormDescription>
                Provide an address or use the button to get your current location.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isPending || isCategorizing || !form.formState.isValid || !imagePreview}>
          {(isPending || isCategorizing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </form>
    </Form>
  );
}
