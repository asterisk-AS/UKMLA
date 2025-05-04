import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Performance() {
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['/api/performance'],
  });

  const { data: specialtyPerformance, isLoading: isLoadingSpecialty } = useQuery({
    queryKey: ['/api/performance/specialty'],
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/performance/progress'],
  });

  const { data: weeklyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/performance/activity'],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-slate-800 mb-2">Performance Analytics</h1>
        <p className="text-slate-600">Track your progress and identify areas for improvement.</p>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-heading">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {isLoadingPerformance ? "..." : performanceData?.totalQuestions || 0}
                </div>
                <p className="text-sm text-slate-500 mt-1">Across all specialties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-heading">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {isLoadingPerformance ? "..." : `${performanceData?.overallAccuracy || 0}%`}
                </div>
                <p className="text-sm text-slate-500 mt-1">Average score on all questions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-heading">Active Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {isLoadingPerformance ? "..." : performanceData?.activeDays || 0}
                </div>
                <p className="text-sm text-slate-500 mt-1">Days with practice sessions in the last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading">Performance by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoadingPerformance ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400">Loading performance data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData?.byDifficulty || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                      <YAxis yAxisId="right" orientation="right" stroke="#16A34A" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="questions" name="Questions Answered" fill="#4F46E5" />
                      <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#16A34A" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Performance by Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {isLoadingSpecialty ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400">Loading specialty data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={specialtyPerformance || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="accuracy" name="Accuracy %" fill="#16A34A" />
                      <Bar dataKey="questions" name="Questions Attempted" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoadingProgress ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400">Loading progress data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressData || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#16A34A" />
                      <Line type="monotone" dataKey="questionsAttempted" name="Questions" stroke="#4F46E5" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoadingActivity ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400">Loading activity data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyActivity || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="questions" name="Questions Answered" fill="#4F46E5" />
                      <Bar dataKey="minutes" name="Minutes Practiced" fill="#F97316" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
