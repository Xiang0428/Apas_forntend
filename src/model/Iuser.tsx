export interface IloginRequest {
  email: string;
  password: string;
}

export interface IloginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

export interface IregisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IregisterResponse {
  success: boolean;
  message: string;
  Data?: {
    Id: number;
    Username: string;
    Email: string;
    Role: string;
  };
}
