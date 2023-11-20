export type ProjectSideBarConfigType = {
  title: string;
  key: string;
};

export type UserInfo = {
  name: string;
  email: string;
  image: string;
  uid: string;
  createdAt: Date;
};

export type ResponseData = {
  errorStatus: boolean;
  message: string;
  code: string;
  statusCode: number;
  data?: any;
  error?: {
    message: string;
    error: any;
  };
};
