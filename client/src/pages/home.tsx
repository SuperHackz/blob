import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, XCircle, Loader2, Trees } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define the form schema
const formSchema = z.object({
  number: z.coerce.number().min(0, "Number must be positive"),
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

// Define the submission type
type Submission = {
  id: number;
  number: number;
  name: string;
  createdAt: string;
};

export default function Home() {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: 0,
      name: "",
    },
  });

  // Fetch names for dropdown
  const { data: names, isLoading: isLoadingNames } = useQuery({
    queryKey: ["/api/names"],
  });

  // Fetch submissions
  const { 
    data: submissions = [], 
    isLoading: isLoadingSubmissions 
  } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  // Create submission mutation
  const createSubmission = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/submissions", values);
      return response.json();
    },
    onSuccess: () => {
      // Clear form
      form.reset({
        number: 0,
        name: "",
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Invalidate submissions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createSubmission.mutate(values);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If less than a minute ago
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return "Just now";
      }
      
      // If less than an hour ago
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      
      // If less than a day ago
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      }
      
      // Otherwise return formatted date
      return format(date, "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Unknown time";
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Trees className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Blob Tree Hasmo
          </h1>
          <p className="text-gray-600">Enter your number and select your name</p>
        </header>

        <Card className="mb-6 shadow-md border-0">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-medium">Your Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter a number"
                          min="0"
                          className="focus:ring-2 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-medium">Your Name</FormLabel>
                      <Select 
                        disabled={isLoadingNames} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select your name" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {names?.map((name: string) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2" 
                  disabled={createSubmission.isPending}
                >
                  {createSubmission.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Entry"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">
                  Your entry has been saved successfully!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSuccess(false)}
                    className="text-green-500 hover:bg-green-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-md border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-800">
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingSubmissions ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p>No entries yet. Be the first to add one!</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-gray-800">{submission.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-blue-600 font-medium">{submission.number}</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatTimestamp(submission.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Blob Tree Hasmo</p>
        </footer>
      </div>
    </div>
  );
}
