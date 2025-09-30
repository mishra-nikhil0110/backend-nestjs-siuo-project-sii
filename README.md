# Backend Nestjs Siuo Project — Project Files : ---->

This Readme.md file contains a ready-to-run NestJS backend project implementing the desired **users** module with CRUD endpoints, predefined data, DTO validation, `GET /users/managed/:id`, and an permission guard.

---

## Project structure

```
bcknd-nest-siuo/
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ constants.ts
│  ├─ users/
│  │  ├─ users.module.ts
│  │  ├─ users.controller.ts
│  │  ├─ users.service.ts
│  │  ├─ dto/create-user.dto.ts
│  │  ├─ dto/update-user.dto.ts
│  │  └─ entities/user.entity.ts
│  └─ guards/permission.guard.ts
└─ README.md
```

---

## package.json ---->

```json
{
  "name": "bcknd-nest-siuo",
  "version": "1.0.0",
  "scripts": {
    "start": "ts-node -r tsconfig-paths/register src/main.ts",
    "start:dev": "nodemon --watch 'src/**/*.ts' --exec ts-node -r tsconfig-paths/register src/main.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2",
    "tsconfig-paths": "^4.2.0",
    "nodemon": "^2.0.22"
  }
}
```

---

## tsconfig.json file -->

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": "./",
    "paths": {}
  },
  "include": ["src/**/*"]
}
```

---

## src/constants.ts ---->

```ts
// Shared pre-defined constants are: users, roles, groups, permissions--->>
export const PREDEFINED_USERS = [
  {
    id: 1,
    name: 'John Doe',
    roles: ['ADMIN', 'PERSONAL'],
    groups: ['GROUP_1', 'GROUP_2'],
  },
  {
    id: 2,
    name: 'Grabriel Monroe',
    roles: ['PERSONAL'],
    groups: ['GROUP_1', 'GROUP_2'],
  },
  { id: 3, name: 'Alex Xavier', roles: ['PERSONAL'], groups: ['GROUP_2'] },
  {
    id: 4,
    name: 'Jarvis Khan',
    roles: ['ADMIN', 'PERSONAL'],
    groups: ['GROUP_2'],
  },
  {
    id: 5,
    name: 'Martines Polok',
    roles: ['ADMIN', 'PERSONAL'],
    groups: ['GROUP_1'],
  },
  {
    id: 6,
    name: 'Gabriela Wozniak',
    roles: ['VIEWER', 'PERSONAL'],
    groups: ['GROUP_1'],
  },
];

export const PREDEFINED_GROUPS = ['GROUP_1', 'GROUP_2'];

export const PREDEFINED_ROLES = ['ADMIN', 'PERSONAL', 'VIEWER'];

export const PREDEFINED_PERMISSIONS = ['CREATE', 'VIEW', 'EDIT', 'DELETE'];

export const MODIFIED_ROLES = [
  {
    name: 'Admin',
    code: 'ADMIN',
    permissions: ['CREATE', 'VIEW', 'EDIT', 'DELETE'],
  },
  { name: 'Personal', code: 'PERSONAL', permissions: [] },
  { name: 'Viewer', code: 'VIEWER', permissions: ['VIEW'] },
];

// map role code to permissions set -->
export const ROLE_PERMISSIONS_MAP = MODIFIED_ROLES.reduce(
  (acc, r) => {
    acc[r.code] = new Set(r.permissions);
    return acc;
  },
  {} as Record<string, Set<string>>,
);
```

---

## src/main.ts file ---->

```ts
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global validation  to validate the DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(3000);
  console.log('Server listening on http://localhost:3000');
}
bootstrap();
```

---

## src/app.module.ts file ---->

```ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

---

## src/users/users.module.ts file ---->

```ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## src/users/entities/user.entity.ts

```ts
export class User {
  id: number;
  name: string;
  roles: string[];
  groups: string[];
}
```

---

## src/users/dto/create-user.dto.ts

```ts
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { PREDEFINED_GROUPS, PREDEFINED_ROLES } from '../../constants';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PREDEFINED_ROLES, { each: true })
  roles: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PREDEFINED_GROUPS, { each: true })
  groups: string[];
}
```

---

## src/users/dto/update-user.dto.ts

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## src/users/users.service.ts

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PREDEFINED_USERS } from '../constants';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // Use an in-memory array initialized from PREDEFINED_USERS global constant.\

  private users: User[] = PREDEFINED_USERS.map((u) => ({ ...u }));
  private nextId = Math.max(...this.users.map((u) => u.id)) + 1;

  findAll(): User[] {
    return this.users.map((u) => ({ ...u }));
  }

  findOne(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(createDto: CreateUserDto): User {
    const newUser: User = {
      id: this.nextId++,
      name: createDto.name,
      roles: [...createDto.roles],
      groups: [...createDto.groups],
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  update(id: number, updateDto: UpdateUserDto): User {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException(`User ${id} not found`);
    const updated = { ...this.users[idx], ...updateDto };
    this.users[idx] = updated;
    return { ...updated };
  }

  remove(id: number): void {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException(`User ${id} not found`);
    this.users.splice(idx, 1);
  }

  //  Returns list of users that the given user id can manage.
  //  Rules: if the user has ADMIN role, they can manage users within their groups.
  //  Otherwise, they manage none.

  getManagedUsers(id: number): User[] {
    const user = this.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    // If user has ADMIN role, collect users who share at least one group with this admin
    if (user.roles.includes('ADMIN')) {
      const adminGroups = new Set(user.groups);
      const managed = this.users.filter((u) => {
        if (u.id === user.id) return false; // don't include self
        // managed if any group intersects
        return u.groups.some((g) => adminGroups.has(g));
      });
      return managed.map((u) => ({ ...u }));
    }
    return [];
  }
}
```

---

## src/guards/permission.guard.ts

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS_MAP } from '../constants';
import { UsersService } from '../users/users.service';

//  PermissionGuard expects a required permission string passed in the route handler via `@RequiredPermission('CREATE')` metadata. For simplicity, we will define a small helper function below to attach metadata. The guard reads `Authorization` header as the user id.

import { SetMetadata } from '@nestjs/common';
export const RequiredPermission = (perm: string) =>
  SetMetadata('requiredPermission', perm);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      'requiredPermission',
      context.getHandler(),
    );
    if (!requiredPermission) return true; // no permission required

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      // No user identified -> deny
      request.res && request.res.status(403);
      throw new Error(
        'ERROR: Not allowed to perform action due to insufficient permissions.',
      );
    }
    const userId = parseInt(authHeader as string, 10);
    const user = this.usersService.findOne(userId);
    if (!user) {
      throw new Error(
        'ERROR: Not allowed to perform action due to insufficient permissions.',
      );
    }
    // collect all permissions from user roles
    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      const perms = ROLE_PERMISSIONS_MAP[role];
      if (perms) perms.forEach((p) => permissions.add(p));
    });
    if (!permissions.has(requiredPermission)) {
      throw new Error(
        'ERROR: Not allowed to perform action due to insufficient permissions.',
      );
    }
    //here it is  allowed
    return true;
  }
}
```

---

## src/users/users.controller.ts

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PermissionGuard,
  RequiredPermission,
} from '../guards/permission.guard';

@Controller('users')
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE (needs CREATE permission)
  @Post()
  @RequiredPermission('CREATE')
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  // GET all users (needs VIEW permission)
  @Get()
  @RequiredPermission('VIEW')
  findAll() {
    return this.usersService.findAll();
  }

  // PATCH partially update (needs EDIT permission)
  @Patch(':id')
  @RequiredPermission('EDIT')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateDto);
  }

  // DELETE user (needs DELETE permission)
  @Delete(':id')
  @RequiredPermission('DELETE')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.usersService.remove(id);
    return { success: true };
  }

  // GET managed users by user id — this is considered a view action as it returns users
  @Get('managed/:id')
  @RequiredPermission('VIEW')
  managed(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getManagedUsers(id);
  }
}
```

---

## How to run this project : ---->

```
# Backend Nest Siuo

1. Install dependencies:
   npm install

2. Start server:
   npm run start

Server runs on http://localhost:3000

Authorization mechanism (for this)  :
- Provide the user id as the plain `Authorization` header value (e.g. `--header 'Authorization: 1'`).

Permissions mapping is defined in `src/constants.ts` under `MODIFIED_ROLES`.

Examples:
- What is Allowed : POST /users with Authorization: 1 (user 1 has ADMIN -> CREATE)
- What Not allowed : POST /users with Authorization: 6 (user 6 has VIEWER only -> no CREATE)
```

---

### Notes & limitations

- This is an in-memory demo. No DB is used and all data is stored in memory and reset on restart.

**“Made with ❤️ by Nikhil”**
