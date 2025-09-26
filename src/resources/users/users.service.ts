import { User, UserRefreshToken } from '@core/entities';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { RegisterDto } from '@resources/auth/dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '@core/messages';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserRefreshToken)
    private readonly userRefreshTokenRepository: Repository<UserRefreshToken>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isActive: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOne(
    where: FindOptionsWhere<User>,
    relations?: FindOptionsRelations<User>,
  ): Promise<User | null> {
    return this.userRepository.findOne({ where, relations });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async createRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<UserRefreshToken> {
    const userRefreshToken = this.userRefreshTokenRepository.create({
      refreshToken,
      user: { id: userId },
    });

    return this.userRefreshTokenRepository.save(userRefreshToken);
  }

  async findRefreshToken(
    refreshToken: string,
  ): Promise<UserRefreshToken | null> {
    return this.userRefreshTokenRepository.findOne({
      where: { refreshToken, isRevoked: false },
      relations: ['user'],
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.userRefreshTokenRepository.update(
      { refreshToken },
      { isRevoked: true },
    );
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.userRefreshTokenRepository.update(
      { user: { id: userId } },
      { isRevoked: true },
    );
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    await this.userRepository.update(userId, {
      ...updateProfileDto,
    });

    return this.findById(userId);
  }
}
