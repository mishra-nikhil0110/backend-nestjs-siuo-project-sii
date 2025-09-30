import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS_MAP } from '../constants';
import { UsersService } from '../users/users.service';

export const RequiredPermission = (perm: string) => SetMetadata('requiredPermission', perm);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private usersService: UsersService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('requiredPermission', context.getHandler());
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new Error('ERROR: Not allowed to perform action due to insufficient permissions.');
    }
    const userId = parseInt(authHeader as string, 10);
    const user = this.usersService.findOne(userId);
    if (!user) {
      throw new Error('ERROR: Not allowed to perform action due to insufficient permissions.');
    }
    const permissions = new Set<string>();
    user.roles.forEach(role => {
      const perms = ROLE_PERMISSIONS_MAP[role];
      if (perms) perms.forEach(p => permissions.add(p));
    });
    if (!permissions.has(requiredPermission)) {
      throw new Error('ERROR: Not allowed to perform action due to insufficient permissions.');
    }
    return true;
  }
}
