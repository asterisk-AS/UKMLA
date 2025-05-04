import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Book, ExternalLink, Search, BookOpen, FileBarChart2 } from "lucide-react";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: guidelines, isLoading: isLoadingGuidelines } = useQuery({
    queryKey: ['/api/resources/guidelines'],
  });
  
  const { data: questionBanks, isLoading: isLoadingQuestionBanks } = useQuery({
    queryKey: ['/api/resources/questionbanks'],
  });
  
  const { data: ukmlaDocs, isLoading: isLoadingUKMLA } = useQuery({
    queryKey: ['/api/resources/ukmla'],
  });

  const filterResources = (resources: any[]) => {
    if (!searchQuery.trim() || !resources) return resources;
    
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-slate-800 mb-2">Medical Resources</h1>
        <p className="text-slate-600">Reference materials to support your UKMLA preparation.</p>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          className="pl-10"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="guidelines">
        <TabsList className="mb-6">
          <TabsTrigger value="guidelines">Clinical Guidelines</TabsTrigger>
          <TabsTrigger value="questionbanks">Question Banks</TabsTrigger>
          <TabsTrigger value="ukmla">UKMLA Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guidelines">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingGuidelines ? (
              Array(6).fill(null).map((_, i) => (
                <Card key={i} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-100 rounded"></div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              filterResources(guidelines || []).map((guideline) => (
                <Card key={guideline.id} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading">{guideline.title}</CardTitle>
                    <CardDescription>{guideline.organization}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{guideline.description}</p>
                    <div className="flex gap-2 mt-3">
                      {guideline.tags.map((tag: string) => (
                        <span 
                          key={tag} 
                          className="bg-primary bg-opacity-10 text-primary text-xs font-medium py-1 px-2 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={guideline.url} target="_blank" rel="noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View Guideline
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {filterResources(guidelines || []).length === 0 && !isLoadingGuidelines && (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-1">No guidelines found</h3>
              <p className="text-slate-500">Try adjusting your search query</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="questionbanks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingQuestionBanks ? (
              Array(3).fill(null).map((_, i) => (
                <Card key={i} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-100 rounded"></div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              filterResources(questionBanks || []).map((bank) => (
                <Card key={bank.id} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading">{bank.title}</CardTitle>
                    <CardDescription>{bank.platform}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{bank.description}</p>
                    <div className="flex items-center mt-3 text-sm">
                      <span className="font-medium mr-6">
                        <span className="text-primary">{bank.questionCount.toLocaleString()}</span> Questions
                      </span>
                      {bank.free ? (
                        <span className="bg-green-100 text-green-700 text-xs font-medium py-1 px-2 rounded">
                          Free Access
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs font-medium py-1 px-2 rounded">
                          Paid Resource
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={bank.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit
                      </a>
                    </Button>
                    {bank.hasDemo && (
                      <Button variant="secondary" size="sm" asChild>
                        <a href={bank.demoUrl} target="_blank" rel="noreferrer">
                          <Book className="mr-2 h-4 w-4" />
                          Try Demo
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {filterResources(questionBanks || []).length === 0 && !isLoadingQuestionBanks && (
            <div className="text-center py-10">
              <FileBarChart2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-1">No question banks found</h3>
              <p className="text-slate-500">Try adjusting your search query</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ukmla">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h3 className="font-heading font-semibold text-lg mb-2 text-blue-800">About the UKMLA</h3>
            <p className="text-blue-700 mb-3">The UK Medical Licensing Assessment (UKMLA) ensures that all doctors who practice in the UK meet a common threshold for safe practice.</p>
            <p className="text-blue-700 mb-0">It consists of an Applied Knowledge Test (AKT) and a Clinical and Professional Skills Assessment (CPSA). The GMC is implementing the UKMLA for international medical graduates from 2024, and for UK medical students graduating from 2025.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingUKMLA ? (
              Array(4).fill(null).map((_, i) => (
                <Card key={i} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-100 rounded"></div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="h-9 bg-slate-200 rounded w-1/3"></div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              filterResources(ukmlaDocs || []).map((doc) => (
                <Card key={doc.id} className="border border-slate-100">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-heading">{doc.title}</CardTitle>
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium py-1 px-2 rounded">
                        {doc.type}
                      </span>
                    </div>
                    <CardDescription>{doc.publisher} • {doc.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{doc.description}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View Document
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {filterResources(ukmlaDocs || []).length === 0 && !isLoadingUKMLA && (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-1">No UKMLA documents found</h3>
              <p className="text-slate-500">Try adjusting your search query</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
