import {
  Controller,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { isValidObjectId } from 'mongoose';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';

@Controller('users')
@UseFilters(AllExceptionsFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.remove(id);
  }
}
