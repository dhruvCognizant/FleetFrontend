export interface NewVehicle{
     vehicleId : string;
      type : string;
      Make:string;
      model: string;
      year:number | null;
      vin: string;
      lastService: string;
}