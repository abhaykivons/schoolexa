import React, { useState } from 'react';
import { EnrollmentStep } from '@/types/staff-enrollment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import StepEditModal from '../modals/StepEditModal';

const CustomizationTab = ({ steps, setSteps }: {
  steps: EnrollmentStep[];
  setSteps: React.Dispatch<React.SetStateAction<EnrollmentStep[]>>;
}) => {
  const [selectedStep, setSelectedStep] = useState<EnrollmentStep | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map(step => (
              <TableRow key={step.id}>
                <TableCell>{step.order}</TableCell>
                <TableCell>{step.name}</TableCell>
                <TableCell>{step.description}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStep(step)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {selectedStep && <StepEditModal step={selectedStep} setSteps={setSteps} close={() => setSelectedStep(null)} />}
      </CardContent>
    </Card>
  );
};

export default CustomizationTab;
