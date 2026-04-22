import {
  apiClient,
  type ApiRequestOptions,
  type createApiClient,
} from '../../../lib/api/api-client';
import type { LoginFormValues, Role, UserInfo } from '../types';
import { parseUserResponse, type UserResponseDto } from './auth-schemas';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

type LoginRequestDto = {
  username: string;
  password: string;
};

export type AuthSuccess = {
  accessToken: string;
  userInfo: UserInfo;
};

function mapRole(role: string): Role | null {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'admin';
    case 'USER':
      return 'user';
    default:
      return null;
  }
}

export function mapUserResponse(dto: UserResponseDto): AuthSuccess {
  return {
    accessToken: dto.accessToken,
    userInfo: {
      name: dto.name,
      userName: dto.username,
      roleList: dto.roleList
        .map(mapRole)
        .filter((role): role is Role => role !== null),
    },
  };
}

export function toLoginRequest(values: LoginFormValues): LoginRequestDto {
  return {
    username: values.userName,
    password: values.password,
  };
}

export function createAuthApi(client: ApiClientLike = apiClient) {
  return {
    async login(values: LoginFormValues) {
      const response = await client.post<UserResponseDto>({
        path: '/user/login',
        body: toLoginRequest(values),
        auth: false,
      });

      return mapUserResponse(parseUserResponse(response, 'login'));
    },
    async restoreSession(options?: Pick<ApiRequestOptions, 'signal'>) {
      const response = await client.post<UserResponseDto>({
        path: '/user/token',
        auth: false,
        signal: options?.signal,
      });

      return mapUserResponse(parseUserResponse(response, 'restoreSession'));
    },
  };
}

export const authApi = createAuthApi();
