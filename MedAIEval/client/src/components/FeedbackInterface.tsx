import { ArrowLeft, ArrowRight, FileText, PlayCircle, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface FeedbackProps {
  questionId: string;
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function FeedbackInterface({ 
  questionId, 
  currentIndex, 
  totalQuestions,
  onPrevious, 
  onNext 
}: FeedbackProps) {
  const { data: feedback, isLoading } = useQuery({
    queryKey: [`/api/feedback/${questionId}`],
  });

  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  if (isLoading) {
    return <div className="p-6 text-center">Loading feedback...</div>;
  }

  if (!feedback) {
    return <div className="p-6 text-center">Unable to load feedback</div>;
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="bg-slate-100 h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Question context */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Clinical Scenario</h3>
            <p>{feedback.scenario}</p>
            <h3 className="font-semibold mt-4 mb-2">Question</h3>
            <p>{feedback.question}</p>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Your Answer</h3>
              <div className="bg-white p-4 rounded-lg border">
                {feedback.userAnswer}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Model Answer</h3>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div dangerouslySetInnerHTML={{ __html: feedback.modelAnswer }} />
              </div>
            </div>
          </div>

          {/* Clinical reasoning analysis */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-700 mb-2">Strengths in Clinical Reasoning</h3>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.strengths.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.areasForImprovement.map((area: string, index: number) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-700 mb-2">Key Learning Points</h3>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.learningPoints.map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Score */}
          <div className="flex justify-center">
            <div className={`${
              parseInt(feedback.score) >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            } px-4 py-2 rounded-full font-semibold`}>
              Score: {feedback.score}%
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button onClick={onPrevious} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={onNext}>
              {currentIndex === totalQuestions - 1 ? "Finish" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}