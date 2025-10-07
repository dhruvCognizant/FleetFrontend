export interface ServiceAssignment {
    assignmentId: number;
    serviceId: string;
    technicianId: number;
    status: 'Assigned' | 'Work In Progress' | 'Completed';
}