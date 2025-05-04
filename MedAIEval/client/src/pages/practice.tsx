import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import QuestionInterface from "@/components/QuestionInterface";
import FeedbackInterface from "@/components/FeedbackInterface";
import FeedbackSummary from "@/components/FeedbackSummary";
import { useToast } from "@/hooks/use-toast";
import { useAIQuestions } from "@/hooks/use-ai-questions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface AnswerData {
  questionId: string;
  answer: string;
  submitted: boolean;
}

export default function Practice() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  
  const specialty = searchParams.get('specialty') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const count = parseInt(searchParams.get('count') || '5');
  const topics = searchParams.get('topics') || '';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    questions, 
    isLoading, 
    isError, 
    error,
    generateQuestions
  } = useAIQuestions();

  // Generate questions when the component mounts or when parameters change
  useEffect(() => {
    if (specialty && difficulty) {
      generateQuestions(specialty, difficulty, count, topics);
    }
  }, [specialty, difficulty, count, topics]);
  
  // Initialize answers array when questions load
  useEffect(() => {
    if (questions && questions.length > 0) {
      // Initialize with empty answers for all questions
      setAnswers(questions.map(q => ({
        questionId: q.id,
        answer: '',
        submitted: false
      })));
    }
  }, [questions]);

  const handlePrevious = () => {
    if (showResults) {
      if (currentFeedbackIndex > 0) {
        setCurrentFeedbackIndex(currentFeedbackIndex - 1);
      }
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Mutation for submitting all answers
  const submitAllAnswersMutation = useMutation({
    mutationFn: async (data: { answers: Array<{questionId: string, answer: string}> }) => {
      return await apiRequest('POST', '/api/answers/batch', data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      // Show results page
      setShowResults(true);
      setCurrentFeedbackIndex(0);
      toast({
        title: "Answers Submitted!",
        description: "You can now review your performance."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting answers",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Submit all answers at once
  const handleSubmitAllAnswers = () => {
    console.log("Submitting all answers...", answers);
    // Filter out any empty answers
    const answersToSubmit = answers.filter(a => a.answer.trim() !== '' && a.submitted);
    console.log("Filtered answers to submit:", answersToSubmit);
    
    if (answersToSubmit.length === 0) {
      toast({
        title: "No Answers Provided",
        description: "Please answer at least one question before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Submit all answers to the batch endpoint
    const payload = {
      answers: answersToSubmit.map(a => ({
        questionId: a.questionId,
        answer: a.answer
      }))
    };
    console.log("Submitting payload:", payload);
    submitAllAnswersMutation.mutate(payload);
  };

  const handleNext = () => {
    if (showResults) {
      if (currentFeedbackIndex < answers.filter(a => a.submitted).length - 1) {
        setCurrentFeedbackIndex(currentFeedbackIndex + 1);
      } else {
        // End of results
        setLocation("/");
        toast({
          title: "Session Complete!",
          description: "You've reviewed all your answers in this session.",
        });
      }
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If we're at the last question, show a submit all button
      handleSubmitAllAnswers();
    }
  };

  const handleSaveAnswer = (answer: string) => {
    if (questions[currentQuestionIndex]) {
      // Update the answer for the current question
      const updatedAnswers = [...answers];
      const currentQuestion = questions[currentQuestionIndex];
      
      const index = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);
      if (index !== -1) {
        updatedAnswers[index] = {
          ...updatedAnswers[index],
          answer,
          submitted: true
        };
        setAnswers(updatedAnswers);
      }
      
      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="mt-6 text-slate-500">Generating AI questions for your practice session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-heading font-bold text-red-600 mb-4">Error Loading Questions</h2>
            <p className="text-slate-600 mb-4">{error?.message || "There was an error generating questions. Please try again."}</p>
            <div className="flex gap-4">
              <Button onClick={() => setLocation("/")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => generateQuestions(specialty, difficulty, count, topics)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-heading font-bold mb-4">No Questions Available</h2>
            <p className="text-slate-600 mb-4">Please select a specialty and difficulty level to generate questions.</p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showResults ? (
        // Show comprehensive feedback summary for all submitted answers
        <FeedbackSummary
          questionIds={answers
            .filter(a => a.submitted && a.answer.trim() !== '')
            .map(a => a.questionId)
          }
          onBackToDashboard={() => setLocation('/')}
        />
      ) : (
        // Show questions interface for answering questions
        <QuestionInterface
          questions={questions}
          currentIndex={currentQuestionIndex}
          onPrevious={handlePrevious}
          onSubmitAnswer={handleSaveAnswer}
          onFinish={handleSubmitAllAnswers}
          savedAnswer={answers[currentQuestionIndex]?.answer || ''}
          isSaving={submitAllAnswersMutation.isPending}
        />
      )}
    </>
  );
}
