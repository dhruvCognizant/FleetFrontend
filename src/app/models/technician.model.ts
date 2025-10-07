export interface Technician {
    technicianId: number; 
    name: string;
    skill: 'Oil Change' | 'Brake Check' | 'Battery Test';
    availability: 'Available' | 'Not Available';
}