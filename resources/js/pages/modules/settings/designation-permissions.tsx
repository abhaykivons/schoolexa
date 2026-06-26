'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Info, LockKeyhole } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface Module {
  id: number;
  name: string;
  description?: string;
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  moduler_id: number;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface PageProps {
  role: Role;
  modules: Module[];
  permissions: Permission[];
  flash?: {
    success?: string;
    error?: string;
  };
}

// Helper type for our processed modules with permissions
interface ModuleWithPermissions extends Module {
  permissions: (Permission & { is_selected: boolean })[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Roles & Permissions',
    href: '/settings/roles',
  },
  {
    title: 'Role Permissions',
    href: '',
  },
];

export default function RolePermissions() {
  const { role, modules, permissions, flash } = usePage().props as PageProps;
  const [activeModule, setActiveModule] = useState<number>(modules[0]?.id || 0);
  const [modulesWithPermissions, setModulesWithPermissions] = useState<ModuleWithPermissions[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  // Process the data to combine modules with their permissions
  useEffect(() => {
    // Create a Set of role permission IDs for faster lookup (handle type mismatches)
    const rolePermissionIds = new Set(
      (role.permissions || []).map((rp: Permission) => Number(rp.id))
    );
    
    const processedModules = modules.map(module => {
      const modulePermissions = permissions
        .filter(p => p.moduler_id === module.id)
        .map(p => ({
          ...p,
          is_selected: rolePermissionIds.has(Number(p.id))
        }));
      
      return {
        ...module,
        permissions: modulePermissions
      };
    });
    
    setModulesWithPermissions(processedModules);
    if (processedModules.length > 0 && !activeModule) {
      setActiveModule(processedModules[0].id);
    }
  }, [modules, permissions, role.permissions]);

  const { props } = usePage<{ flash: { success?: string; error?: string } }>();

  useEffect(() => {
    if (props.flash?.success) {
      toast.success(props.flash.success);
    }
    if (props.flash?.error) {
      toast.error(props.flash.error);
    }
  }, [props.flash]);


  const togglePermission = (permissionId: number) => {
    const updatedModules = modulesWithPermissions.map(module => ({
      ...module,
      permissions: module.permissions.map(p => 
        p.id === permissionId ? { ...p, is_selected: !p.is_selected } : p
      )
    }));
    
    setModulesWithPermissions(updatedModules);
  };

  const toggleAllPermissionsInModule = (moduleId: number, selectAll: boolean) => {
    const updatedModules = modulesWithPermissions.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          permissions: module.permissions.map(p => ({ ...p, is_selected: selectAll }))
        };
      }
      return module;
    });
    
    setModulesWithPermissions(updatedModules);
  };

  const formatPermissionName = (name: string) => {
    // Convert snake_case to Title Case with spaces
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const submit = () => {
    // Collect all selected permissions
    const selectedPermissionIds: number[] = [];
    modulesWithPermissions.forEach(module => {
      module.permissions.forEach(permission => {
        if (permission.is_selected) {
          selectedPermissionIds.push(permission.id);
        }
      });
    });

    setIsSubmitting(true);

    // Use router.post directly with the data to ensure it's sent correctly
    router.post(
      route('roles.permissions.update', role.id),
      { permissions: selectedPermissionIds },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Permissions updated successfully');
          setIsSubmitting(false);
        },
        onError: () => {
          toast.error('Failed to update permissions');
          setIsSubmitting(false);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      }
    );
  };
  
  const areAllModulePermissionsSelected = (moduleId: number) => {
    const module = modulesWithPermissions.find(m => m.id === moduleId);
    if (!module || module.permissions.length === 0) return false;
    
    return module.permissions.every(p => p.is_selected);
  };

  const areSomeModulePermissionsSelected = (moduleId: number) => {
    const module = modulesWithPermissions.find(m => m.id === moduleId);
    if (!module || module.permissions.length === 0) return false;
    
    return module.permissions.some(p => p.is_selected) && 
           !module.permissions.every(p => p.is_selected);
  };

  const activeModuleData = modulesWithPermissions.find(m => m.id === activeModule);

  // Handle indeterminate state for the select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current && activeModuleData) {
      const isIndeterminate = areSomeModulePermissionsSelected(activeModuleData.id);
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [modulesWithPermissions, activeModule]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${role.name} Permissions`} />

      <SettingsLayout>
        <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <HeadingSmall 
              title={`${role.name} Permissions`} 
              description="Manage module-wise permissions for this role" 
            />
            <div className='flex gap-4'>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={submit} disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Save Permissions
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar with modules */}
            <div className="w-full md:w-auto">
              <Card className='gap-2 py-4'>
                <CardHeader>
                  <CardTitle className="text-lg">Modules</CardTitle>
                </CardHeader>
                <CardContent className="p-0 min-h-screen">
                  <div className="flex flex-col">
                    {modulesWithPermissions.map((module) => (
                      <button
                        key={module.id}
                        className={`px-4 py-3 text-left border-b border-gray-100 dark:border-gray-800 flex justify-between items-center ${
                          activeModule === module.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setActiveModule(module.id)}
                      >
                        <span className='text-sm'>{module.name}</span>
                        <LockKeyhole className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions content */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              {activeModuleData ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{activeModuleData.name} Permissions</CardTitle>
                      <div className="flex items-center gap-2">
                        <input
                          ref={selectAllCheckboxRef}
                          type="checkbox"
                          checked={areAllModulePermissionsSelected(activeModuleData.id)}
                          onChange={(e) => 
                            toggleAllPermissionsInModule(activeModuleData.id, e.target.checked)
                          }
                          className="h-4 w-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer accent-primary data-[checked]:bg-primary data-[checked]:border-primary"
                          style={{
                            accentColor: areAllModulePermissionsSelected(activeModuleData.id) ? 'hsl(var(--primary))' : undefined
                          }}
                        />
                        <Label className="cursor-pointer">Select All</Label>
                      </div>
                    </div>
                    {activeModuleData.description && (
                      <CardDescription>{activeModuleData.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    {activeModuleData.permissions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {activeModuleData.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={permission.is_selected}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <Label htmlFor={`permission-${permission.id}`} className="text-base cursor-pointer text-sm">
                                {formatPermissionName(permission.name)}
                              </Label>
                            </div>
                            
                            {permission.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{permission.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No permissions available for this module.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Select a module to manage permissions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}