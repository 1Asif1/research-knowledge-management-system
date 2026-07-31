// Matches PaperService.Dto.common.ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Matches org.springframework.data.domain.Page<T> as serialized by Spring Data
// (used by PaperController#searchPapers -> Page<PaperResponse>)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;      // current page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

// Matches ReviewService.dto.Response.ErrorResponse
export interface ApiErrorResponse {
  status: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  fieldErrors?: { field: string; message: string; rejectedValue: unknown }[];
}
