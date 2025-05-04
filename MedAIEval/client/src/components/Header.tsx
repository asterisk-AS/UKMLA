import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Stethoscope, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Stethoscope className="text-primary h-6 w-6" />
          <Link href="/">
            <a className="font-heading font-bold text-xl text-slate-800">MedQualify</a>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <a className={`font-medium ${isActive('/') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Dashboard
            </a>
          </Link>
          <Link href="/practice">
            <a className={`font-medium ${isActive('/practice') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Practice
            </a>
          </Link>
          <Link href="/performance">
            <a className={`font-medium ${isActive('/performance') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Performance
            </a>
          </Link>
          <Link href="/resources">
            <a className={`font-medium ${isActive('/resources') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Resources
            </a>
          </Link>
        </nav>
        
        {/* User profile and mobile menu */}
        <div className="flex items-center space-x-6">
          <Button 
            variant="ghost" 
            className="md:hidden text-slate-700 p-2"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">
              {user?.name || 'Medical Student'}
            </span>
            <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center text-slate-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
