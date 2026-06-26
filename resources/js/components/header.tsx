import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Command, Search, Settings, Sun, Moon, Monitor, ChevronRight, Home, LogOut, CheckCircle, AlertTriangle, Info, XCircle, Check, Trash2, Copy } from "lucide-react";
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  action_url?: string;
  action_text?: string;
  trigger_event?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  time_ago: string;
}

interface HeaderProps {
  user?: User;
  className?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function Header({ user, breadcrumbs, className = "" }: HeaderProps) {
  // Get shared data from Inertia
  const { auth } = usePage<SharedData>().props;
  
  // Fallback avatar if user doesn't have one
  const defaultAvatar = "/assets/10.png";
  
  // Use the appearance hook
  const { appearance, updateAppearance } = useAppearance();
  
  // State for copy feedback
  const [copied, setCopied] = useState(false);
  
  // Check if user is admin
  const isAdmin = (auth.user as any)?.type === 'admin';
  const companyUuid = auth.company?.uuid;
  
  // Copy UUID to clipboard
  const copyUuidToClipboard = async () => {
    if (companyUuid) {
      try {
        await navigator.clipboard.writeText(companyUuid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy UUID:', err);
      }
    }
  };

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="size-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="size-4 text-amber-500" />;
      case 'error': return <XCircle className="size-4 text-red-500" />;
      default: return <Info className="size-4 text-blue-500" />;
    }
  };

  const cleanup = useMobileNavigation();
  const handleLogout = () => {
      cleanup();
      router.flushAll();
  };
  
  // Get the appropriate icon based on current appearance
  const getThemeIcon = () => {
    switch(appearance) {
      case 'dark': return Moon;
      case 'light': return Sun;
      case 'system': return Monitor;
      default: return Sun;
    }
  };
  
  const ThemeIcon = getThemeIcon();
  
  return (
    <header className={`sticky top-0 z-50 shrink-0 rounded-t-lg items-center gap-2 p-3 backdrop-blur-md transition-[width,height] inset-shadow-sm ease-linear ${className}`}>
      <div className="flex w-full items-center gap-1 lg:gap-2 border-b pb-3">
        <div className="lg:flex-1">
          <div className="relative hidden max-w-sm flex-1 lg:block">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-full cursor-pointer rounded-md border pl-10 pr-4 text-sm shadow-xs"
            />
            <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
              <Command className="size-3" />
              <span>k</span>
            </div>
          </div>
          
          <div className="block lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Company UUID - Only visible to admins */}
          {isAdmin && companyUuid && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 gap-1.5 text-xs font-mono bg-muted/50 hover:bg-muted border-dashed"
                    onClick={copyUuidToClipboard}
                  >
                    <span className="hidden sm:inline truncate max-w-[120px]">{companyUuid}</span>
                    <span className="sm:hidden truncate max-w-[80px]">{companyUuid.slice(0, 8)}...</span>
                    {copied ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Click to copy School Token'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 relative"
                onClick={() => fetchNotifications()}
              >
                <Bell className={`size-4 ${unreadCount > 0 ? 'animate-tada' : ''}`} />
                {unreadCount > 0 && (
                  <span className="bg-destructive absolute -end-0.5 -top-0.5 flex items-center justify-center size-4 shrink-0 rounded-full text-[10px] text-white font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllAsRead();
                    }}
                  >
                    <Check className="size-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        if (notification.action_url) {
                          router.visit(notification.action_url);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!notification.is_read ? 'font-medium' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {notification.time_ago}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
              >
                <ThemeIcon className="size-4" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => updateAppearance('light')}
                className="flex items-center gap-2"
              >
                <Sun className="size-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateAppearance('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="size-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateAppearance('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
              >
                <Settings className="size-4 animate-tada" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-2 h-4" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                {user?.name && (
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name}
                  </span>
                )}
                <div className="relative flex size-8 shrink-0 overflow-hidden rounded-full">
                  <img
                    src={user?.avatar || defaultAvatar}
                    alt={user?.name || "User avatar"}
                    className="aspect-square size-full"
                  />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="flex w-full items-center" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                  <LogOut className="mr-2" />
                    Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Breadcrumbs Section */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="pt-2 flex items-center text-sm">
          <Link 
            href="/dashboard" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{item.title}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}