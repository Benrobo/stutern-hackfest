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

export enum RESPONSE_CODE {
  // Common Responses
  INVALID_FIELDS,
  USER_NOT_FOUND,
  CHAT_NOT_FOUND,
  USER_ALREADY_EXIST,
  INVALID_EMAIL,
  INVALID_LOGIN_CREDENTIALS,
  INTERNAL_SERVER_ERROR,
  INVALID_STACK_COMBO,
  VALIDATION_ERROR,
  STACK_NOT_AVAILABLE,
  PROJECTS,
  CONVERSATION_NOT_FOUND,
  CONVERSATION_ALREADY_IN_CONTROL,
  CHAT_ESCALLATED,

  // User Operations
  SIGNUP_SUCCESSFULL,
  LOGIN_SUCCESSFULL,
  UNAUTHORIZED,
  FORBIDDEN,
  INVALID_TRANSACTION_PIN,
  USER_DETAILS,
  SETTINGS_DETAILS,
  EXTRACT_LINKS_ERROR,

  // Secrets Responses
  SECRET_CREATED,
  SECRET_EXISTS,
  SECRET_DETAILS,
  SECRET_NOT_FOUND,

  // Project Responses
  SUCCESS,
  PROJECT_NOT_FOUND,
  MONOREPO_SETUP_SUCCESS,
  MONOREPO_SETUP_FAILED,
  REFINED_PROJECT_GENERATION_FAILED,
  REFINED_PROJECT_GENERATION_SUCCEEDED,
  INVALID_TOKEN,
}