import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

@Injectable()
export class UsersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req.user)
      return next.handle().pipe(
        tap(() => {
          console.log(`user ${req.user.username} is logged in`);
        }),
      );
    else
      return next.handle().pipe(
        tap(() => {
          console.log('no body logged in!!!');
        }),
      );
  }
}
