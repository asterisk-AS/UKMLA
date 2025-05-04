import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Brain, Heart, Stethoscope, TrendingUp, ArrowRight, PlusCircle, History, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface DashboardProps {
  onStartSession: (specialty: string, difficulty: string, count: number, topics: string) => void;
}

export default function Dashboard({ onStartSession }: DashboardProps) {
  const [specialty, setSpecialty] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [topics, setTopics] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/specialties'],
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/activity'],
  });

  const generateQuestions = () => {
    if (!specialty) {
      toast({
        title: "Specialty required",
        description: "Please select a medical specialty",
        variant: "destructive"
      });
      return;
    }

    if (!difficulty) {
      toast({
        title: "Difficulty required",
        description: "Please select a difficulty level",
        variant: "destructive"
      });
      return;
    }

    onStartSession(specialty, difficulty, parseInt(questionCount), topics);
  };

  return (
    <section className="container mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="md:flex items-center">
          <div className="p-6 md:p-8 md:w-2/3">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">Welcome back!</h1>
            <p className="text-indigo-100 mb-4">Continue your UKMLA preparation with AI-generated questions. You're making great progress!</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button className="bg-white text-primary hover:bg-opacity-90" onClick={() => setLocation("/practice")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Question
              </Button>
              <Button variant="outline" className="bg-indigo-600 bg-opacity-30 text-white border-indigo-300 hover:bg-opacity-40">
                <History className="mr-2 h-4 w-4" />
                Resume Session
              </Button>
            </div>
          </div>
          <div className="hidden md:block md:w-1/3 p-6">
            <svg 
              viewBox="0 0 300 300"
              className="w-full max-w-xs mx-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M150 22c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128S220.7 22 150 22zm83.5 126c-1.1 38.8-30.6 71.9-68.7 78.5v-23.3c0-2.6-2.1-4.7-4.7-4.7h-18.3c-2.6 0-4.7 2.1-4.7 4.7v23.3c-41.4-7.2-72.2-44.4-70.5-88 1.7-43.5 37.5-79.3 81-81 48-1.9 88 37.6 88 85.8 0 1.9-.3 3.8-.5 5.7h.4z" fill="#fff" fillOpacity=".2"/>
              <path d="M178.8 107.2l-18.9 18.9c-3.5-1.9-7.5-2.9-11.8-2.9-13.5 0-24.5 11-24.5 24.5s11 24.5 24.5 24.5 24.5-11 24.5-24.5c0-4.3-1.1-8.4-3-11.8l18.9-18.9c1.9-1.9 1.9-4.9 0-6.8-1.9-1.9-4.9-1.9-6.8 0h-.9z" fill="#fff" fillOpacity=".2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Questions Answered</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLoadingStats ? "..." : stats?.questionsAnswered || 0}
                </h3>
              </div>
              <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-secondary font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {isLoadingStats ? "..." : stats?.questionsWeeklyChange || 0}%
              </span>
              <span className="text-slate-500 ml-2">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Accuracy Rate</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLoadingStats ? "..." : `${stats?.accuracyRate || 0}%`}
                </h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Check className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-secondary font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {isLoadingStats ? "..." : stats?.accuracyWeeklyChange || 0}%
              </span>
              <span className="text-slate-500 ml-2">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Strongest Area</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLoadingStats ? "..." : stats?.strongestArea || "N/A"}
                </h3>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-secondary font-medium">
                {isLoadingStats ? "..." : `${stats?.strongestAreaAccuracy || 0}% accuracy`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Needs Improvement</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {isLoadingStats ? "..." : stats?.weakestArea || "N/A"}
                </h3>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-500 font-medium">
                {isLoadingStats ? "..." : `${stats?.weakestAreaAccuracy || 0}% accuracy`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Categories Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-xl">Practice by Specialty</h2>
          <Button variant="link" className="text-primary font-medium text-sm hover:underline">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingCategories ? (
            Array(4).fill(null).map((_, i) => (
              <Card key={i} className="border border-slate-100 question-card hover:shadow-md hover:border-slate-200">
                <div className="h-3 bg-slate-200"></div>
                <CardContent className="p-5">
                  <div className="h-24 flex items-center justify-center">
                    <p className="text-slate-400">Loading categories...</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            categories?.map((category, index) => (
              <Card 
                key={category.id} 
                className="border border-slate-100 overflow-hidden question-card hover:shadow-md hover:border-slate-200"
                onClick={() => setLocation(`/practice?specialty=${category.name}`)}
              >
                <div className={`h-3 ${category.colorClass || "bg-primary"}`}></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading font-semibold text-lg">{category.name}</h3>
                    <span className={`${category.bgClass || "bg-primary bg-opacity-10"} ${category.textClass || "text-primary"} text-xs font-medium py-1 px-2 rounded`}>
                      {category.questionCount} Questions
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`${category.colorClass || "bg-primary"} h-2 rounded-full`} 
                          style={{ width: `${category.masteryPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 ml-2">{category.masteryPercentage}% mastered</span>
                    </div>
                    <ArrowRight className={`${category.textClass || "text-primary"} h-5 w-5`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* AI Question Generator */}
      <Card className="border border-slate-100 mb-8">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-xl mb-4">Generate AI Questions</h2>
          <p className="text-slate-600 mb-6">Customize your practice with AI-generated questions on specific topics.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="specialty" className="text-sm font-medium text-slate-700 mb-1">Medical Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger id="specialty" className="w-full">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {isLoadingCategories ? (
                        <SelectItem value="loading">Loading specialties...</SelectItem>
                      ) : (
                        categories?.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="difficulty" className="text-sm font-medium text-slate-700 mb-1">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="UKMLA">UKMLA Level</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="question-count" className="text-sm font-medium text-slate-700 mb-1">Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger id="question-count" className="w-full">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="specific-topics" className="text-sm font-medium text-slate-700 mb-1">Specific Topics (optional)</Label>
              <Input 
                type="text" 
                id="specific-topics" 
                placeholder="E.g., Heart failure, Valvular disease" 
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                className="bg-primary text-white hover:bg-indigo-700" 
                onClick={generateQuestions}
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-xl">Recent Activity</h2>
          <Button variant="link" className="text-primary font-medium text-sm hover:underline">
            View All
          </Button>
        </div>
        
        <Card className="border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {isLoadingActivity ? (
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-full h-9 w-9"></div>
                  <div className="flex-grow">
                    <div className="h-5 bg-slate-100 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-slate-100 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : (
              recentActivity?.map(activity => (
                <div key={activity.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer">
                  <div className={`${activity.iconBgClass} p-2 rounded-full`}>
                    {activity.icon === 'check' && <Check className={activity.iconClass} />}
                    {activity.icon === 'star' && <Check className={activity.iconClass} />}
                    {activity.icon === 'sync' && <Check className={activity.iconClass} />}
                    {activity.icon === 'exclamation' && <Check className={activity.iconClass} />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-slate-500">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{activity.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
