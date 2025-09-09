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
import { Camera, Loader2, MapPin, Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { getCategoryForImage, createIssue } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  location: z.string().min(3, { message: "Please provide a location." }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photoDataUri: z.string().min(1, { message: 'Please upload a photo.'}),
});

// Speech recognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent { results: SpeechRecognitionResultList; }
interface SpeechRecognitionResultList { [index: number]: SpeechRecognitionResult; length: number; }
interface SpeechRecognitionResult { [index: number]: SpeechRecognitionAlternative; isFinal: boolean; length: number; }
interface SpeechRecognitionAlternative { transcript: string; confidence: number; }
interface SpeechRecognitionErrorEvent { error: string; message: string; }
declare var SpeechRecognition: { prototype: SpeechRecognition; new(): SpeechRecognition };


const translations = {
  en: {
    voiceHelpTitle: "Voice assistance available",
    voiceHelpDesc: "Use the microphone icons to fill the form with your voice.",
    welcomeMessage: "Welcome to the issue reporting page. You can fill this form using your voice. Click the microphone button next to a field to start.",
    issuePhoto: "Photo of the Issue",
    uploadText: "Tap here to upload a photo",
    title: "Title",
    titlePlaceholder: "e.g., Large pothole on main road",
    description: "Description",
    descriptionPlaceholder: "e.g., A large pothole is causing traffic issues...",
    category: "Category",
    categoryPlaceholder: "Select a category",
    location: "Location",
    locationPlaceholder: "Enter street name or address",
    locationDesc: "Or click the pin to use your current location.",
    submitReport: "Submit Report",
    listening: "Listening... speak now.",
    locating: "Fetching location...",
    reportSubmitted: "Report Submitted!",
    reportSubmittedDesc: "Thank you for helping improve our community.",
    reportFailed: "Submission Failed",
    reportFailedDesc: "Please try again later.",
    imageCategorized: "Image categorized as:",
    imageCategoryFailed: "Could not categorize image.",
    locationFound: "Location found!",
    locationFailed: "Could not get location. Please enter it manually.",
  },
  hi: {
    voiceHelpTitle: "आवाज सहायता उपलब्ध है",
    voiceHelpDesc: "अपनी आवाज से फॉर्म भरने के लिए माइक्रोफ़ोन आइकन का उपयोग करें।",
    welcomeMessage: "समस्या रिपोर्टिंग पेज पर आपका स्वागत है। आप इस फॉर्म को अपनी आवाज का उपयोग करके भर सकते हैं। शुरू करने के लिए किसी भी फ़ीeld के बगल में माइक्रोफ़ोन बटन पर क्लिक करें।",
    issuePhoto: "समस्या का फोटो",
    uploadText: "फोटो अपलोड کرنے کے لیے یہاں ٹیپ کریں۔",
    title: "शीर्षक",
    titlePlaceholder: "जैसे, मुख्य सड़क पर बड़ा गड्ढा",
    description: "विवरण",
    descriptionPlaceholder: "जैसे, एक बड़े गड्ढे के कारण यातायात की समस्या...",
    category: "श्रेणी",
    categoryPlaceholder: "एक श्रेणी चुनें",
    location: "स्थान",
    locationPlaceholder: "गली का नाम या पता दर्ज करें",
    locationDesc: "या अपने वर्तमान स्थान का उपयोग करने के लिए पिन पर क्लिक करें।",
    submitReport: "रिपोर्ट सबमिट करें",
    listening: "सुन रहा हूँ... अब बोलें।",
    locating: "स्थान प्राप्त हो रहा है...",
    reportSubmitted: "रिपोर्ट सबमिट हो गई!",
    reportSubmittedDesc: "हमारे समुदाय को बेहतर बनाने में मदद करने के लिए धन्यवाद।",
    reportFailed: "सबमिशन विफल",
    reportFailedDesc: "कृपया बाद में पुन प्रयास करें।",
    imageCategorized: "छवि को इस रूप में वर्गीकृत किया गया है:",
    imageCategoryFailed: "छवि को वर्गीकृत नहीं किया जा सका।",
    locationFound: "स्थान मिल गया!",
    locationFailed: "स्थान प्राप्त नहीं हो सका। कृपया इसे मैन्युअल रूप से दर्ज करें।",
  },
};


export function ReportForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentField, setCurrentField] = useState<'title' | 'description' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { toast } = useToast();
  const t = translations[language];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: '', description: '', location: '', photoDataUri: '' },
  });

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        if (currentField) {
          form.setValue(currentField, transcript);
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        setCurrentField(null);
      };
       recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setCurrentField(null);
      };
    }
  }, [currentField, form]);

  const startSpeechRecognition = (field: 'title' | 'description') => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      setCurrentField(field);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentField(null);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const speakInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setImagePreview(dataUri);
      form.setValue('photoDataUri', dataUri);
      
      setIsCategorizing(true);
      toast({ title: "Analyzing image..." });
      
      const result = await getCategoryForImage(dataUri);
      if (result.category && result.category !== 'Other') {
        form.setValue('category', result.category);
        toast({ title: t.imageCategorized, description: result.category });
      } else if (result.error) {
         toast({ variant: 'destructive', title: t.imageCategoryFailed, description: result.error });
      } else {
        toast({ variant: 'destructive', title: t.imageCategoryFailed });
      }
      setIsCategorizing(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleLocation = () => {
    setIsLocating(true);
    toast({ title: t.locating });
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      form.setValue('latitude', latitude);
      form.setValue('longitude', longitude);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`);
        const data = await response.json();
        if (data.display_name) {
          form.setValue('location', data.display_name);
          toast({ title: t.locationFound });
        } else {
            form.setValue('location', `${latitude}, ${longitude}`);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        form.setValue('location', `${latitude}, ${longitude}`);
      }
      setIsLocating(false);
    }, (error) => {
      console.error(error);
      setIsLocating(false);
      toast({ variant: 'destructive', title: t.locationFailed });
    });
  };

  function onSubmit(values: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      try {
        await createIssue(values);
        toast({ title: t.reportSubmitted, description: t.reportSubmittedDesc });
        router.push('/');
        router.refresh(); // Force refresh to get new data
      } catch (error) {
        toast({ variant: "destructive", title: t.reportFailed, description: t.reportFailedDesc });
        console.error("Submission failed", error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Language Toggle and Voice Instructions */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-blue-900">{t.voiceHelpTitle}</h3>
                <p className="text-sm text-blue-700">{t.voiceHelpDesc}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="rounded-lg border-blue-300 bg-white shadow-sm hover:bg-blue-100"
                >
                  <Languages className="h-4 w-4" />
                  {language === 'en' ? 'हिंदी' : 'English'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => speakInstructions(t.welcomeMessage)}
                  className="rounded-lg border-blue-300 bg-white shadow-sm hover:bg-blue-100"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="photoDataUri"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t.issuePhoto}</FormLabel>
                <FormControl>
                  <div className="relative flex h-52 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Issue preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Camera className="mx-auto h-10 w-10" />
                        <p className="mt-1 text-sm">{t.uploadText}</p>
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
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t.title}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={t.titlePlaceholder}
                      {...field}
                      className="rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-100"
                    />
                  </FormControl>
                  {speechSupported && (
                    <Button
                      type="button"
                      variant={isListening && currentField === 'title' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        isListening && currentField === 'title'
                          ? stopSpeechRecognition()
                          : startSpeechRecognition('title')
                      }
                      disabled={isListening && currentField !== 'title'}
                      className="rounded-lg"
                    >
                      {isListening && currentField === 'title' ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {isListening && currentField === 'title' && (
                  <FormDescription className="text-sm text-blue-600">{t.listening}</FormDescription>
                )}
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t.description}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Textarea
                      placeholder={t.descriptionPlaceholder}
                      className="resize-none rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-100"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  {speechSupported && (
                    <Button
                      type="button"
                      variant={isListening && currentField === 'description' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        isListening && currentField === 'description'
                          ? stopSpeechRecognition()
                          : startSpeechRecognition('description')
                      }
                      disabled={isListening && currentField !== 'description'}
                      className="rounded-lg"
                    >
                      {isListening && currentField === 'description' ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {isListening && currentField === 'description' && (
                  <FormDescription className="text-sm text-blue-600">{t.listening}</FormDescription>
                )}
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t.category}</FormLabel>
                <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-100">
                      <SelectValue placeholder={t.categoryPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg border border-gray-200 shadow-md">
                    {issueCategories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="cursor-pointer hover:bg-blue-50"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t.location}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={t.locationPlaceholder}
                      {...field}
                      className="rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-100"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocation}
                    disabled={isLocating}
                    className="rounded-lg"
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <FormDescription className="text-sm text-gray-500">{t.locationDesc}</FormDescription>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white shadow-md hover:bg-blue-700 focus:ring focus:ring-blue-200"
            disabled={isPending || isCategorizing}
          >
            {(isPending || isCategorizing) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t.submitReport}
          </Button>
        </form>
      </Form>
    </div>
  );
}