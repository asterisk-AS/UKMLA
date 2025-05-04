import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  specialty: string;
  difficulty: string;
  scenario: string;
  question: string;
}

interface QuestionInterfaceProps {
  questions: Question[];
  currentIndex: number;
  onPrevious: () => void;
  onSubmitAnswer: (answer: string) => void;
  onFinish?: () => void; // Optional callback when clicking finish directly
  savedAnswer?: string; // Optional previously saved answer
  isSaving?: boolean; // Optional loading state for the submit button
}

export default function QuestionInterface({ 
  questions, 
  currentIndex, 
  onPrevious, 
  onSubmitAnswer,
  onFinish,
  savedAnswer = "",
  isSaving = false
}: QuestionInterfaceProps) {
  const [answer, setAnswer] = useState(savedAnswer);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Handle saving/continuing without submitting to API yet
  const handleSaveAndContinue = () => {
    if (!answer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer to the question",
        variant: "destructive",
      });
      return;
    }
    
    // First save the current answer
    onSubmitAnswer(answer);
    
    // If it's the last question and we have a finish handler, call it after saving
    if (isLastQuestion && onFinish) {
      // Small delay to ensure the answer is saved before submission
      setTimeout(() => {
        onFinish();
      }, 100);
    }
  };

  // Focus textarea and set saved answer when question changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setAnswer(savedAnswer || "");
  }, [currentIndex, savedAnswer]);

  if (!questions || questions.length === 0 || !questions[currentIndex]) {
    return <div className="container mx-auto px-4 py-8 text-center">No questions available</div>;
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <section className="container mx-auto px-4 py-6">
      <Card className="border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-100 h-2">
          <div 
            className="bg-primary h-2 rounded-r-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <CardContent className="p-6">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="bg-primary bg-opacity-10 text-primary text-xs font-medium py-1 px-2 rounded">
                {currentQuestion.specialty}
              </span>
              <span className="bg-amber-100 text-amber-700 text-xs font-medium py-1 px-2 rounded ml-2">
                {currentQuestion.difficulty}
              </span>
            </div>
            <div className="text-sm text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Clinical Scenario */}
          <div className="mb-6">
            <h2 className="font-heading font-bold text-xl mb-4">Clinical Scenario</h2>
            <p className="text-slate-700 mb-4">
              {currentQuestion.scenario}
            </p>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-lg mb-2">Question</h3>
            <p className="text-slate-700 mb-4">
              {currentQuestion.question}
            </p>

            {/* Answer Input */}
            <div className="border border-slate-200 rounded-md p-4 mb-4">
              <Label htmlFor="answer" className="font-medium text-slate-700 mb-2">Your Answer:</Label>
              <Textarea
                id="answer"
                ref={textareaRef}
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={onPrevious}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-indigo-700"
                onClick={handleSaveAndContinue}
                disabled={isLastQuestion && isSaving}
              >
                {currentIndex < questions.length - 1 ? 
                  "Save & Continue" : 
                  (isSaving ? "Processing..." : "Save & Finish")
                }
                {isSaving ? (
                  <span className="ml-2 animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                ) : (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
