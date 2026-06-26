import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming you already use shadcn/ui table

const forms = [
  { name: "Pre-Enrolment Form", status: "Active" },
  { name: "Student Enrolment Form", status: "Active" },
  { name: "Student Health Care Summary", status: "Inactive" },
  { name: "Education and Language History", status: "Active" },
  {
    name: "Online services agreement and publishing of students images and work for school purposes",
    status: "Pending",
  },
  { name: "Online Services Permissions", status: "Active" },
  { name: "Enrolment Document Checklist", status: "Active" },
];

const FormTab: React.FC = () => {
  return (
    <Card className="shadow-none p-4">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Form Name</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{form.name}</TableCell>
              <TableCell className="text-center">{form.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default FormTab;