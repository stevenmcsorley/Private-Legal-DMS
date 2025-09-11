import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../auth.service';

/**
 * Decorator to extract the current user from the request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);