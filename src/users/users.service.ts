import { Injectable, NotFoundException } from '@nestjs/common';
import { PREDEFINED_USERS } from '../constants';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = PREDEFINED_USERS.map(u => ({ ...u }));
  private nextId = Math.max(...this.users.map(u => u.id)) + 1;

  findAll(): User[] {
    return this.users.map(u => ({ ...u }));
  }

  findOne(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(createDto: CreateUserDto): User {
    const newUser: User = {
      id: this.nextId++,
      name: createDto.name,
      roles: [...createDto.roles],
      groups: [...createDto.groups]
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  update(id: number, updateDto: UpdateUserDto): User {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException(`User ${id} not found`);
    const updated = { ...this.users[idx], ...updateDto };
    this.users[idx] = updated;
    return { ...updated };
  }

  remove(id: number): void {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException(`User ${id} not found`);
    this.users.splice(idx, 1);
  }

  getManagedUsers(id: number): User[] {
    const user = this.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    if (user.roles.includes('ADMIN')) {
      const adminGroups = new Set(user.groups);
      const managed = this.users.filter(u => {
        if (u.id === user.id) return false;
        return u.groups.some(g => adminGroups.has(g));
      });
      return managed.map(u => ({ ...u }));
    }
    return [];
  }
}
