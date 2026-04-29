import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notify.error(formatError(error));
      return throwError(() => error);
    })
  );
};

function formatError(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Cannot reach API. Check that the gateway and services are running.';

  const body = error.error;
  if (body && typeof body === 'object') {
    if (typeof body.detail === 'string') return body.detail;
    if (typeof body.title === 'string') return body.title;
    if (typeof body.message === 'string') return body.message;
    if (body.ValidationErrors) {
      const errs = Object.values(body.ValidationErrors).flat() as string[];
      if (errs.length) return errs.join(' | ');
    }
  }
  if (typeof body === 'string' && body.trim().length) return body;
  return `${error.status} ${error.statusText || 'Request failed'}`;
}
