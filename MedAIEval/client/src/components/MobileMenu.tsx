import { Link, useLocation } from "wouter";
import { X, LayoutDashboard, Edit, BarChart2, BookOpen, Settings, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location, setLocation] = useLocation();
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const navigateTo = (path: string) => {
    setLocation(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white h-full w-4/5 max-w-sm py-6 px-4 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Stethoscope className="text-primary h-5 w-5" />
            <span className="font-heading font-bold text-lg">MedQualify</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-200">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-slate-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium">{user?.name || 'Medical Student'}</p>
            <p className="text-sm text-slate-500">{user?.role || 'Clinical Student'}</p>
          </div>
        </div>
        
        <nav className="flex flex-col space-y-4">
          <Button 
            variant="ghost" 
            className={`justify-start ${location === '/' ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-slate-100 text-slate-700'} rounded-md font-medium`}
            onClick={() => navigateTo('/')}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${location === '/practice' ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-slate-100 text-slate-700'} rounded-md font-medium`}
            onClick={() => navigateTo('/practice')}
          >
            <Edit className="mr-3 h-5 w-5" />
            Practice
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${location === '/performance' ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-slate-100 text-slate-700'} rounded-md font-medium`}
            onClick={() => navigateTo('/performance')}
          >
            <BarChart2 className="mr-3 h-5 w-5" />
            Performance
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${location === '/resources' ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-slate-100 text-slate-700'} rounded-md font-medium`}
            onClick={() => navigateTo('/resources')}
          >
            <BookOpen className="mr-3 h-5 w-5" />
            Resources
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start hover:bg-slate-100 text-slate-700 rounded-md font-medium"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-200">
          <Button variant="ghost" className="justify-start text-slate-700 hover:text-red-500 w-full">
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
