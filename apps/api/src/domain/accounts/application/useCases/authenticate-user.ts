import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { Encrypter } from '../cryptography/encrypter';
import { HashComparer } from '../cryptography/hash-comparer';
import { UsersRepository } from '../repositories/users-repository';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

interface AuthenticateUserUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUserUseCaseResponseData {
  accessToken: string;
}

type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError,
  AuthenticateUserUseCaseResponseData
>;
@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(password, user.password);

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
      isMaster: user.isMaster(),
    });

    return right({
      accessToken,
    });
  }
}
