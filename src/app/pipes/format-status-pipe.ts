import { Pipe, PipeTransform } from '@angular/core';
import { ServiceAssignment } from '../models/assignment.model';

@Pipe({
  name: 'formatStatus',
  standalone: true
})
export class FormatStatusPipe implements PipeTransform {

  transform(value: ServiceAssignment['status']): string {
    if (!value) {
      return '';
    }
    return `Status: ${value.toUpperCase()}`;
  }
}