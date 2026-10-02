export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}
