export enum EResponseMessage {
  SUCCESS = 'success',
  SIGN_UP_SUCCESS = 'sign up success, try login',
  LOGIN_SUCCESS = 'login success',
  UPDATE_SUCCESS = 'update success',
  NOMINATED_SUCCESS = 'nominated this Agenda Successfully',
  PASSWORD_UPDATE_SUCCESS = 'password updated.',
  USER_UPDATE_SUCCESS = 'user profile updated.',
  DELETE_ITEM = 'delete item completed.',
  DELETE_ACCOUNT = "You've completed your account withdrawal.",
  CANCEL = 'CANCEL',
}

export enum EErrorMessage {
  NOT_FOUND = "Can't not find item",
  NOT_FOUND_USER = "Can't not find user",
  NOT_PERMISSIONS = 'You do not have the necessary permissions',
  NOT_CREATE_PERIOD = "Can't not create period, it's not time yet",
  NOT_TIME_YET = "it's not time yet",
  RETIRED_ACCOUNT = 'Retired Account, please contact FAQ pages',
  EXISITEING_REVIEW = 'There are already reviews created.',
  EXISITING_USER = 'Existing User Email',
  LOGIN_FAILED = 'login Failed',
}
