export class CreateUserDto {
  email: string;
  password: string;
  username: string;
  avatar?: string; // URL or path after upload, not raw File
}

export class SignInDto {
  email: string;
  password: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isSteamLinked: boolean;
}

export class TokensDto {
  accessToken: string;
  refreshToken: string;
}

export class AuthResponseDto {
  user: UserResponseDto;
  tokens: TokensDto;
}
