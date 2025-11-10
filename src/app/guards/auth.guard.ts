import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommonService } from '../services/common-service';

export const isLoggedInGuard: CanActivateFn = () => {
  const commonService = inject(CommonService);
  const router = inject(Router);

  if (commonService.getRole() !== null) {
    // User is logged in, allow access
    return true;
  }

  // User is not logged in, redirect to login
  router.navigate(['/login']);
  return false;
};

export function hasRole(expectedRole: 'admin' | 'technician'): CanActivateFn {
  return () => {
    const commonService = inject(CommonService);
    const router = inject(Router);
    const currentRole = commonService.getRole();

    if (currentRole === expectedRole) {
      // Role matches, allow access
      return true;
    }

    // Role does not match, redirect to their own dashboard
    if (currentRole === 'admin') {
      router.navigate(['/admin']);
    } else if (currentRole === 'technician') {
      router.navigate(['/technician']);
    } else {
      // a fallback.
      router.navigate(['/login']);
    }
    return false;
  };
}