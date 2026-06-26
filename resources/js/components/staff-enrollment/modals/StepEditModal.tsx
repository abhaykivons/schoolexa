import React, { useState } from 'react';
import { EnrollmentStep } from '@/types/staff-enrollment';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const StepEditModal = ({ step, setSteps, close }: {
  step: EnrollmentStep;
  setSteps: React.Dispatch<React.SetStateAction<EnrollmentStep[]>>;
  close: () => void;
}) => {
  const [localStep, setLocalStep] = useState(step);

  const save = () => {
    setSteps(prev => prev.map(s => s.id === localStep.id ? localStep : s));
    close();
  };

  return (
    <Dialog open onOpenChange={close}>
      <DialogContent>
        <Input value={localStep.name} onChange={e => setLocalStep({ ...localStep, name: e.target.value })} placeholder="Step Name" />
        <Input value={localStep.description} onChange={e => setLocalStep({ ...localStep, description: e.target.value })} placeholder="Description" />
        <Button onClick={save}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

export default StepEditModal;