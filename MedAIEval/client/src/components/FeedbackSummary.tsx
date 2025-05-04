import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, InfoIcon, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

interface Feedback {
  id: string;
  specialty: string;
  difficulty: string;
  scenario: string;
  question: string;
  userAnswer: string;
  score: number;
  modelAnswer: string;
  strengths: string[];
  areasForImprovement: string[];
  learningPoints: string[];
  relatedResources: string[];
}

interface FeedbackSummaryProps {
  questionIds: string[];
  onBackToDashboard: () => void;
}

export default function FeedbackSummary({ questionIds, onBackToDashboard }: FeedbackSummaryProps) {
  // Fetch all feedback for the given question IDs
  const feedbackQueries = questionIds.map(id => {
    return useQuery({
      queryKey: [`/api/feedback/${id}`],
      queryFn: getQueryFn<Feedback>({ on401: 'returnNull' }),
      retry: 1, // Only retry once to avoid too many retries with 404s
      refetchOnWindowFocus: false,
      staleTime: Infinity // This data doesn't change during the session
    });
  });

  // Check if all queries are loading
  const isLoading = feedbackQueries.some(query => query.isLoading);
  
  // Extract all feedback data that was successfully loaded
  const feedbackData = feedbackQueries
    .filter(query => query.data && !query.isError) // Skip errors or missing data
    .map(query => query.data) as Feedback[];
    
  // Only show error if ALL feedback failed to load
  const isError = feedbackData.length === 0 && feedbackQueries.length > 0 && !isLoading;

  // Calculate overall score
  const totalScore = feedbackData.reduce((sum, feedback) => sum + feedback.score, 0);
  const averageScore = feedbackData.length > 0 ? Math.round(totalScore / feedbackData.length) : 0;
  const totalQuestions = feedbackData.length;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || feedbackData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-heading font-bold text-red-600 mb-4">Unable to Load Feedback</h2>
            <p className="text-slate-600 mb-6">We're having trouble retrieving your feedback data. Please try again later.</p>
            <Button onClick={onBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-8">
          {/* Summary Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h1 className="text-2xl font-heading font-bold text-slate-800">Session Summary</h1>
              <div className="mt-2 sm:mt-0 flex items-center">
                <span className="text-2xl font-bold mr-2 text-indigo-600">{averageScore}/10</span>
                <span className="text-sm text-slate-500">Average Score</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {feedbackData[0]?.specialty && (
                <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary">
                  {feedbackData[0].specialty}
                </Badge>
              )}
              {feedbackData[0]?.difficulty && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700">
                  {feedbackData[0].difficulty}
                </Badge>
              )}
              <Badge variant="outline" className="bg-slate-100 text-slate-700">
                {totalQuestions} Questions
              </Badge>
            </div>
          </div>

          <Separator className="mb-8" />
          
          {/* Feedback Cards for each question */}
          <div className="space-y-10">
            {feedbackData.map((feedback, index) => (
              <div key={feedback.id} className="pb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold text-slate-800">Question {index + 1}</h2>
                  <div className="mt-2 sm:mt-0 flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-indigo-600">Score: {feedback.score}/10</span>
                  </div>
                </div>
                
                {/* Clinical Scenario */}
                <div className="mb-6">
                  <h3 className="font-medium text-slate-800 mb-2">Clinical Scenario</h3>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-md">{feedback.scenario}</p>
                </div>
                
                {/* Question */}
                <div className="mb-6">
                  <h3 className="font-medium text-slate-800 mb-2">Question</h3>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-md">{feedback.question}</p>
                </div>
                
                {/* User's Answer */}
                <div className="mb-6">
                  <h3 className="font-medium text-slate-800 mb-2">Your Answer</h3>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-md">{feedback.userAnswer}</p>
                </div>
                
                {/* Model Answer */}
                <div className="mb-6">
                  <h3 className="font-medium text-slate-800 mb-2">Model Answer</h3>
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <p className="text-slate-700">{feedback.modelAnswer}</p>
                  </div>
                </div>
                
                {/* Feedback Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-50 p-4 rounded-md">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                      <h3 className="font-medium text-emerald-800">Strengths</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {feedback.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Areas for Improvement */}
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="flex items-center mb-3">
                      <InfoIcon className="h-5 w-5 text-amber-500 mr-2" />
                      <h3 className="font-medium text-amber-800">Areas for Improvement</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {feedback.areasForImprovement.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Learning Points */}
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium text-blue-800">Learning Points</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {feedback.learningPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Related Resources */}
                  <div className="bg-purple-50 p-4 rounded-md">
                    <div className="flex items-center mb-3">
                      <Zap className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-medium text-purple-800">Related Resources</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                      {Array.isArray(feedback.relatedResources) ? (
                        feedback.relatedResources.map((resource: any, i: number) => (
                          <li key={i} className="py-1">
                            {typeof resource === 'string' ? (
                              resource
                            ) : resource.url ? (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {resource.title || resource.url}
                              </a>
                            ) : (
                              resource.title || 'Resource'
                            )}
                          </li>
                        ))
                      ) : (
                        <li>No related resources available</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {index < feedbackData.length - 1 && (
                  <Separator className="mt-8" />
                )}
              </div>
            ))}
          </div>
          
          {/* Back to Dashboard Button */}
          <div className="mt-8 text-center">
            <Button onClick={onBackToDashboard} className="px-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
