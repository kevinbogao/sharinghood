export enum HttpStatusCodeEnum {
  OK = 200,
  // CREATED = 201,
  // ACCEPTED = 202,
  // NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  // RESET_CONTENT = 205,
  // PARTIAL_CONTENT = 206,
  // FOUND = 302,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export enum HttpMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
}

export enum ResponseErrorCodeEnum {
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  ALREADY_EXISTS_ERROR = "ALREADY_EXISTS_ERROR",
  UNIMPLEMENTED_ERROR = "UNIMPLEMENTED_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MISMATCHED_FILE_CHECKSUM_ERROR = "MISMATCHED_FILE_CHECKSUM_ERROR",
  NOT_FOUND_USER = "NOT_FOUND_USER",
  MAX_CITY_LEADERS_REACHED = "MAX_CITY_LEADERS_REACHED",
  ROUTE_ACCESS_FORBIDDEN = "ROUTE_ACCESS_FORBIDDEN",
  NOT_SET_AUTH_NONCE = "NOT_SET_AUTH_NONCE",
  INVALID_SLOT_TOKEN = "INVALID_SLOT_TOKEN",
  INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  NOT_FOUND_REQUEST_BODY = "NOT_FOUND_REQUEST_BODY",
  SELF_REFERENCE_FORBIDDEN = "SELF_REFERENCE_FORBIDDEN",
  NOT_A_MEMBER = "NOT_A_MEMBER",
  NOT_FOUND_DATE_NEED = "NOT_FOUND_DATE_NEED",
  FORBIDDEN_ITEM = "FORBIDDEN_ITEM",
  INVALID_RESET_CODE = "INVALID_RESET_CODE",
  INVALIDE_BOOKING_STATUS = "INVALIDE_BOOKING_STATUS",
}