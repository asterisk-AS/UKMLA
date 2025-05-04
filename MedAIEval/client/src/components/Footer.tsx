import { Link } from "wouter";
import { Stethoscope, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between md:items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <Stethoscope className="text-primary h-5 w-5 mr-2" />
              <span className="font-heading font-bold text-lg text-slate-800">MedQualify</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">AI-powered UKMLA preparation for medical students</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Resources</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/resources/guidelines"><a className="text-slate-600 hover:text-primary">Clinical Guidelines</a></Link></li>
                <li><Link href="/resources/questions"><a className="text-slate-600 hover:text-primary">Question Bank</a></Link></li>
                <li><Link href="/resources/ukmla"><a className="text-slate-600 hover:text-primary">UKMLA Updates</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Company</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/about"><a className="text-slate-600 hover:text-primary">About Us</a></Link></li>
                <li><Link href="/contact"><a className="text-slate-600 hover:text-primary">Contact</a></Link></li>
                <li><Link href="/pricing"><a className="text-slate-600 hover:text-primary">Pricing</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/terms"><a className="text-slate-600 hover:text-primary">Terms of Service</a></Link></li>
                <li><Link href="/privacy"><a className="text-slate-600 hover:text-primary">Privacy Policy</a></Link></li>
                <li><Link href="/cookies"><a className="text-slate-600 hover:text-primary">Cookie Policy</a></Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 mt-6 pt-6 text-center md:flex md:justify-between md:items-center">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} MedQualify. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-primary">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
