import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const Rounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, Rounds);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const toBeUpdatedUser = await this.userModel.findById(userId).exec();

    if (!toBeUpdatedUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const existingUser = await this.userModel
      .findOne({
        email: updateUserDto.email,
        _id: { $ne: userId },
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (updateUserDto.password) {
      const Rounds = 10;
      const hashedPassword = await bcrypt.hash(updateUserDto.password, Rounds);
      updateUserDto.password = hashedPassword;
    }

    await this.userModel.findByIdAndUpdate(userId, updateUserDto).exec();

    return this.userModel.findById(userId).exec();
  }

  async remove(id: string): Promise<User> {
    const data = await this.userModel.findByIdAndDelete(id).exec();
    if (!data) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return data;
  }
}
