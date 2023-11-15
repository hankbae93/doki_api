export enum EResponseMessage {
  SUCCESS = 'success',
  LOGIN_SUCCESS = 'login success',
  UPDATE_SUCCESS = 'update success',
  PASSWORD_UPDATE_SUCCESS = 'password updated.',
  USER_UPDATE_SUCCESS = 'user profile updated.',
  DELETE_ITEM = 'delete item completed.',
  DELETE_ACCOUNT = "You've completed your account withdrawal.",
}

export enum EErrorMessage {
  NOT_FOUND = "Can't not find item",
  NOT_FOUND_USER = "Can't not find user",
  NOT_TIME_YET = "Can't not create period, it's not time yet",
}
