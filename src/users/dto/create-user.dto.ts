import { IsArray, IsIn, IsNotEmpty, IsString, MaxLength, ArrayMinSize } from 'class-validator';
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
