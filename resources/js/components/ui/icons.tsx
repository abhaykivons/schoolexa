import React, { lazy } from 'react';

export const ICONS = {
Home: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Home }))),
Grid: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Grid }))),
UserCheck: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.UserCheck }))),
UserPlus: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.UserPlus }))),
Clock: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Clock }))),
Calendar: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Calendar }))),
DollarSign: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.DollarSign }))),
CreditCard: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.CreditCard }))),
Users: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
Heart: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Heart }))),
FileText: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.FileText }))),
TrendingUp: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.TrendingUp }))),
Shield: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Shield }))),
GraduationCap: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.GraduationCap }))),
School: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.School }))),
BookOpen: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.BookOpen }))),
Link: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Link2 }))),
MapPin: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.MapPin }))),
Trophy: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Trophy }))),
Vote: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Vote }))),
Soup: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.ChefHat }))),
Tent: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.Tent }))),
ShoppingBag: React.lazy(() => import('lucide-react').then(mod => ({ default: mod.ShoppingBag }))),
  // ... other icons
};
