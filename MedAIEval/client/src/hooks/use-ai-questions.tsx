import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  specialty: string;
  difficulty: string;
  scenario: string;
  question: string;
}

interface GenerateQuestionsResponse {
  provider?: string;
  questions: Question[];
}

export function useAIQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const generateQuestionsMutation = useMutation({
    mutationFn: async (params: { 
      specialty: string; 
      difficulty: string; 
      count: number; 
      topics?: string;
    }) => {
      return await apiRequest('POST', '/api/questions/generate', params);
    },
    onMutate: () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
    },
    onSuccess: async (response) => {
      try {
        const data = await response.json() as GenerateQuestionsResponse;
        setQuestions(data.questions || []);
        setProvider(data.provider || null);
        
        // Show which AI provider was used
        if (data.provider) {
          toast({
            title: "Questions Generated",
            description: `Using ${data.provider} AI provider`,
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        setIsError(true);
        setError(new Error("Failed to parse question data"));
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to parse question data",
          variant: "destructive",
        });
      }
    },
    onError: (err) => {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsLoading(false);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate questions",
        variant: "destructive",
      });
    }
  });

  const generateQuestions = (
    specialty: string, 
    difficulty: string, 
    count: number = 5, 
    topics: string = ""
  ) => {
    generateQuestionsMutation.mutate({ specialty, difficulty, count, topics });
  };

  return {
    questions,
    provider,
    isLoading,
    isError,
    error,
    generateQuestions
  };
}
