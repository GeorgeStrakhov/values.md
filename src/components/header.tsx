'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Settings, Lock } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession } from 'next-auth/react';

// Main public navigation - only mature, polished pages
const publicNavigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Research', href: '/research' },
  { name: 'Waterfall', href: '/waterfall' },
];

// Admin-only navigation - diagnostic, experimental, and configuration pages
const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin' },
  { name: 'System Health', href: '/health' },
  { name: 'System Status', href: '/system-status' },
  { name: 'Test Results', href: '/test-results' },
  { name: 'Debug Store', href: '/debug' },
  { name: 'LLM Experiments', href: '/admin/experiment' },
  { name: 'Values Workbench', href: '/values-workbench' },
  { name: 'Ontology Lab', href: '/ontology-lab' },
  { name: 'Pattern Lab', href: '/pattern-lab' },
  { name: 'Alignment Tests', href: '/alignment-experiments' },
  { name: 'Template Tests', href: '/template-experiments' },
  { name: 'Growth Map', href: '/growth-map' },
  { name: 'Project Map', href: '/project-map' },
  { name: 'Repo Map', href: '/repo-map' },
];

export function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="font-bold text-lg text-foreground/100 hover:text-foreground/80 transition-colors">values.md</span>
        </Link>

        {/* Desktop Navigation & Theme Toggle */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Admin Dropdown */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Admin menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Admin Tools
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {adminNavigation.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="w-full">
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Navigate through the values.md platform
                </SheetDescription>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                {/* Public Navigation */}
                <nav className="grid gap-4">
                  <div className="text-sm font-semibold text-muted-foreground px-3">Main</div>
                  {publicNavigation.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                
                {/* Admin Navigation */}
                {isAdmin && (
                  <nav className="grid gap-4">
                    <div className="text-sm font-semibold text-muted-foreground px-3 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Admin Tools
                    </div>
                    {adminNavigation.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>
  );
}