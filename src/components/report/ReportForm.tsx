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

const FormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.string({ required_error: "Please select a category." }),
  location: z.string().min(3, { message: "Please provide a location." }),
  photoDataUri: z.string().optional(),
});

// Type declarations for Web Speech API
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

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Language translations
const translations = {
  en: {
    voiceHelpTitle: "Voice Help Available",
    voiceHelpDesc: "Use the microphone buttons to speak your title and description",
    welcomeMessage: "Welcome to the civic issue reporting form. You can use your voice to fill in the title and description. Click the microphone buttons next to each field to start speaking.",
    issuePhoto: "Issue Photo",
    uploadText: "Click to upload or use camera",
    title: "Title",
    titlePlaceholder: "e.g., Large pothole",
    description: "Description",
    descriptionPlaceholder: "Tell us more about the issue, including its exact location and any potential hazards.",
    category: "Category",
    categoryPlaceholder: "Select an issue category",
    location: "Location / Address",
    locationPlaceholder: "e.g., 123 Main St, near the park",
    locationDesc: "Provide an address or use the button to get your current location.",
    submitReport: "Submit Report",
    listening: "🎤 Listening... Speak now",
    speechCaptured: "Speech Captured!",
    addedText: "Added text to",
    speechError: "Speech Recognition Error",
    speechErrorDesc: "Could not capture speech. Please try again.",
    speechNotSupported: "Speech Not Supported",
    speechNotSupportedDesc: "Your browser doesn't support speech recognition.",
    imageCategorized: "Image Categorized!",
    weThink: "We think this is a",
    aiSuggested: "AI suggested:",
    selectClosest: "Please select the closest match.",
    categorizationFailed: "Categorization Failed",
    locationFound: "Location Found!",
    locationFoundDesc: "Your current location has been added.",
    locationError: "Location Error",
    locationErrorDesc: "Could not get your location.",
    reportSubmitted: "Report Submitted!",
    thankYou: "Thank you for your contribution.",
    submissionSuccess: "Your report has been submitted successfully. Thank you for your contribution.",
    submissionError: "Submission Error",
    somethingWrong: "Something went wrong."
  },
  hi: {
    voiceHelpTitle: "आवाज सहायता उपलब्ध",
    voiceHelpDesc: "शीर्षक और विवरण बोलने के लिए माइक्रोफोन बटन का उपयोग करें",
    welcomeMessage: "नागरिक समस्या रिपोर्टिंग फॉर्म में आपका स्वागत है। आप शीर्षक और विवरण बोलकर भर सकते हैं।",
    issuePhoto: "समस्या की तस्वीर",
    uploadText: "अपलोड करने या कैमरा उपयोग करने के लिए क्लिक करें",
    title: "शीर्षक",
    titlePlaceholder: "जैसे, बड़ा गड्ढा",
    description: "विवरण",
    descriptionPlaceholder: "समस्या के बारे में विस्तार से बताएं, सटीक स्थान और खतरों सहित।",
    category: "श्रेणी",
    categoryPlaceholder: "समस्या की श्रेणी चुनें",
    location: "स्थान / पता",
    locationPlaceholder: "जैसे, 123 मेन स्ट्रीट, पार्क के पास",
    locationDesc: "पता प्रदान करें या अपना वर्तमान स्थान प्राप्त करने के लिए बटन का उपयोग करें।",
    submitReport: "रिपोर्ट जमा करें",
    listening: "🎤 सुन रहे हैं... अब बोलें",
    speechCaptured: "आवाज कैप्चर हुई!",
    addedText: "टेक्स्ट जोड़ा गया",
    speechError: "वाक् पहचान त्रुटि",
    speechErrorDesc: "आवाज कैप्चर नहीं हो सकी। कृपया पुनः प्रयास करें।",
    speechNotSupported: "आवाज समर्थित नहीं",
    speechNotSupportedDesc: "आपका ब्राउज़र वाक् पहचान का समर्थन नहीं करता।",
    imageCategorized: "छवि वर्गीकृत!",
    weThink: "हमें लगता है यह है",
    aiSuggested: "AI का सुझाव:",
    selectClosest: "कृपया निकटतम मैच चुनें।",
    categorizationFailed: "वर्गीकरण असफल",
    locationFound: "स्थान मिला!",
    locationFoundDesc: "आपका वर्तमान स्थान जोड़ा गया है।",
    locationError: "स्थान त्रुटि",
    locationErrorDesc: "आपका स्थान नहीं मिल सका।",
    reportSubmitted: "रिपोर्ट जमा की गई!",
    thankYou: "आपके योगदान के लिए धन्यवाद।",
    submissionSuccess: "आपकी रिपोर्ट सफलतापूर्वक जमा कर दी गई है। धन्यवाद।",
    submissionError: "जमा करने में त्रुटि",
    somethingWrong: "कुछ गलत हुआ।"
  }
};

export function ReportForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentField, setCurrentField] = useState<'title' | 'description' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const { toast } = useToast();
  const t = translations[language];

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          
          if (currentField === 'title') {
            form.setValue('title', transcript);
          } else if (currentField === 'description') {
            const currentDesc = form.getValues('description');
            const newDesc = currentDesc ? `${currentDesc} ${transcript}` : transcript;
            form.setValue('description', newDesc);
          }
          
          toast({
            title: t.speechCaptured,
            description: `${t.addedText} ${currentField}: "${transcript}"`
          });
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setIsListening(false);
          toast({
            variant: "destructive",
            title: t.speechError,
            description: t.speechErrorDesc
          });
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [currentField, form, toast, language, t]);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    }
  }, [language]);

  const startSpeechRecognition = (field: 'title' | 'description') => {
    if (!speechSupported) {
      toast({
        variant: "destructive",
        title: t.speechNotSupported,
        description: t.speechNotSupportedDesc
      });
      return;
    }

    if (recognitionRef.current) {
      setCurrentField(field);
      recognitionRef.current.start();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
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
              toast({ 
                title: t.imageCategorized, 
                description: `${t.weThink} "${matchingCategory}".` 
              });
              speakInstructions(language === 'hi' 
                ? `छवि को ${matchingCategory} के रूप में वर्गीकृत किया गया है`
                : `Image categorized as ${matchingCategory}`
              );
            } else {
              toast({ 
                title: t.imageCategorized, 
                description: `${t.aiSuggested} "${result.category}". ${t.selectClosest}` 
              });
            }
          } else if(result.error) {
            toast({ variant: "destructive", title: t.categorizationFailed, description: result.error });
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`);
          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }
          const data = await response.json();
          if (data && data.display_name) {
            form.setValue('location', data.display_name);
            toast({ title: t.locationFound, description: t.locationFoundDesc });
            speakInstructions(language === 'hi' ? "आपका स्थान मिल गया है।" : "Your location has been found.");
          } else {
            throw new Error("Could not fetch address");
          }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            const locString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
            form.setValue('location', locString);
            toast({ variant: "destructive", title: t.locationError, description: "Could not fetch address. Using coordinates instead." });
        } finally {
            setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        toast({ variant: "destructive", title: t.locationError, description: t.locationErrorDesc });
      }
    );
  };
  
  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      try {
        await createIssue(data)
        toast({ title: t.reportSubmitted, description: t.thankYou });
        speakInstructions(language === 'hi' 
          ? "आपकी रिपोर्ट सफलतापूर्वक जमा कर दी गई है। धन्यवाद।"
          : "Your report has been submitted successfully. Thank you for your contribution."
        );
      } catch (err) {
        toast({ variant: "destructive", title: t.submissionError, description: t.somethingWrong });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Language Toggle and Voice Instructions */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">{t.voiceHelpTitle}</h3>
              <p className="text-sm text-blue-700">
                {t.voiceHelpDesc}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                {language === 'en' ? 'हिंदी' : 'English'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => speakInstructions(t.welcomeMessage)}
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
          render={() => (
            <FormItem>
              <FormLabel>{t.issuePhoto}</FormLabel>
              <FormControl>
                <div className="relative flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Issue preview" fill objectFit="cover" className="rounded-lg" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera className="mx-auto h-8 w-8" />
                      <p>{t.uploadText}</p>
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

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.title}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder={t.titlePlaceholder} {...field} />
                </FormControl>
                {speechSupported && (
                  <Button
                    type="button"
                    variant={isListening && currentField === 'title' ? "default" : "outline"}
                    size="sm"
                    onClick={() => isListening && currentField === 'title' ? stopSpeechRecognition() : startSpeechRecognition('title')}
                    disabled={isListening && currentField !== 'title'}
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
                <FormDescription className="text-blue-600">
                  {t.listening}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.description}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea
                    placeholder={t.descriptionPlaceholder}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                {speechSupported && (
                  <Button
                    type="button"
                    variant={isListening && currentField === 'description' ? "default" : "outline"}
                    size="sm"
                    onClick={() => isListening && currentField === 'description' ? stopSpeechRecognition() : startSpeechRecognition('description')}
                    disabled={isListening && currentField !== 'description'}
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
                <FormDescription className="text-blue-600">
                  {t.listening}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.category}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.categoryPlaceholder} />
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

        {/* Location Field */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.location}</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder={t.locationPlaceholder} {...field} />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleLocation} disabled={isLocating}>
                  {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </div>
              <FormDescription>
                {t.locationDesc}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isPending || isCategorizing || !form.formState.isValid || !imagePreview}>
          {(isPending || isCategorizing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t.submitReport}
        </Button>
      </form>
    </Form>
  );
}
