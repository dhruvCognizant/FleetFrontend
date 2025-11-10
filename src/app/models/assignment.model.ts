export interface ServiceAssignment {
  _id: string;
  vehicleVIN: string;
  serviceType: string;
  description?: string;
  dueServiceDate?: string;
  technicianId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  technicianName: string;
  status: string;
  assignmentDate?: string;
  completedOn?: string;
  technicianCompletedOn?: string;
  payment?: {
    createdAt: string;
    updatedAt: string;
    __v?: number;
  };
}
