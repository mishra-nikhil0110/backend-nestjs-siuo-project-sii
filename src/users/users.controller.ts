import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionGuard, RequiredPermission } from '../guards/permission.guard';

@Controller('users')
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequiredPermission('CREATE')
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @Get()
  @RequiredPermission('VIEW')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @RequiredPermission('EDIT')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @RequiredPermission('DELETE')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.usersService.remove(id);
    return { success: true };
  }

  @Get('managed/:id')
  @RequiredPermission('VIEW')
  managed(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getManagedUsers(id);
  }
}
