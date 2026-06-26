import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import FormTab from './tabs/form-tab';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Onboarding Settings',
    href: '/admission-settings',
  },
];


const OnboardingSettings: React.FC = ({
}) => {

  const { auth } = usePage().props;



  return (

    <AppLayout>
      <Head title="Admission Settings" />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs}/>
        <div className='p-2 pt-0 mb-12 lg:mb-0 md:mb-0'>
            <Card className="p-4 shadow-none">
                <Tabs defaultValue="documents" >
                    <TabsList>
                        <TabsTrigger value="documents">Forms Templates</TabsTrigger>
                        <TabsTrigger value="approvers">Approvers</TabsTrigger>
                        <TabsTrigger value="emailTemplate">Email Templates</TabsTrigger>
                        <TabsTrigger value="configuration">Form Configurations</TabsTrigger>
                    </TabsList>
                    <TabsContent value="documents">
                        <FormTab />
                    </TabsContent>
                    <TabsContent value="approvers">
                    </TabsContent>
                    <TabsContent value="configuration">
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
      </div>
    </AppLayout>

  );
};

export default OnboardingSettings;