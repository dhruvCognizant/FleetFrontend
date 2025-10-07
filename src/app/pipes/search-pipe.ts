import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchId',
  standalone:true
})
export class SearchPipe implements PipeTransform {

  transform(vehicles: any[], searchText: string): any[] {    
    if (!vehicles || !searchText) return vehicles;
    const lower = searchText.toLowerCase();
    return vehicles.filter(vehicle =>vehicle.id.toLowerCase().includes(lower));
  }
}
