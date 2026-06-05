export type Role = 'admin' | 'user';

export type UserInfo = {
  name: string;
  userName: string;
  roleList: Role[];
};

export type AuthSession = {
  accessToken: string | null;
  userInfo: UserInfo | null;
  hydrated: boolean;
};

export type LoginFormValues = {
  userName: string;
  password: string;
};
