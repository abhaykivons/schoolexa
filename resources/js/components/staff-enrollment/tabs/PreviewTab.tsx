import React from 'react';
import { EnrollmentFormConfig } from '@/types/staff-enrollment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PreviewTab = ({ config }: { config: EnrollmentFormConfig }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Title:</strong> {config.formTitle}</p>
        <p><strong>Description:</strong> {config.formDescription}</p>
        <p><strong>Notification Email:</strong> {config.notificationEmail}</p>
      </CardContent>
    </Card>
  );
};

export default PreviewTab;