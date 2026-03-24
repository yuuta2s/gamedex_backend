import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    // async signIn(email: string, password: string): Promise<AuthResponseDto> {
    //     const user = await this.validateUser(email, password);
    //     const tokens = this.generateTokens(user);
    //     await this.usersRepository.updateResetToken(user, tokens.refreshToken);
    //     return this.authMapper.toAuthResponse(user, tokens);
    // }


    // async signInWithSteam(): Promise<> {

    // }

    // async signUp(): Promise<> {

    // }

    async validateUser(email: string, password: string) {

    }

    // private generateTokens(user: UserDocument): TokensDto {
    // const payload = { userId: user._id.toString(), email: user.email };
    // const accessToken = this.jwtService.sign(payload);
    // const refreshSecret = this.JWT_CONFIG.JWT_REFRESH_SECRET ?? `${this.JWT_CONFIG.JWT_SECRET}_refresh`;
    // const refreshToken = this.jwtService.sign(payload, {
    //   secret: refreshSecret,
    //   expiresIn: '7d',
    // });

    // return {
    //   accessToken,
    //   refreshToken,
    // };
//   }

}

export class CreateUserDto {
    email: string;
    password: string;
    username: string;
    avatar: File ;
}

export class AuthResponseDto {
    user: UserResponseDto;
    tokens: TokensDto;
}

export class UserResponseDto {
 id: string;
  email: string;
  firstname: string;
}

export class TokensDto {
    accessToken: string;
    refreshToken: string;
}