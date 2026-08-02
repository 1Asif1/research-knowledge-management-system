// Matches ReviewService DTOs (ResearcherController / EditorController / ReviewerController)
import { ReviewStatus, ReviewerRecommendation, EditorDecision, AssignmentStatus } from './review.enums';

// ---- Researcher ----
export interface SubmitPaperRequest {
  title: string;
  abstractText: string;
  fileName: string;
  filePath: string;
  researcherId: number;
}

export interface UploadVersionRequest {
  fileName: string;
  filePath: string;
  changeSummary?: string;
}

export interface PaperSubmissionResponse {
  paperId: number;
  reviewId?: number | null;
  title: string;
  researcherId: number;
  submittedDate: string; // ISO date-time
  reviewStatus?: string | null;
  currentVersion?: number | null;
}

export interface PaperVersionResponse {
  versionId: number;
  versionNumber: number;
  filename: string;
  changeSummary: string;
}

// ---- Editor ----
export interface AssignReviewerRequest {
  reviewId: number;
  reviewerId: number;
  editorId: number;
}

export interface EditorDecisionRequest {
  decision: EditorDecision;
}

export interface ReviewProcessResponse {
  reviewId: number;
  paperId: number;
  paperTitle?: string | null;
  editorId: number | null;
  reviewerId: number | null;
  currentVersion: number;
  currentVersionId: number | null;
  reviewStatus: ReviewStatus;
  reviewerRecommendation: ReviewerRecommendation | null;
  editorDecision: EditorDecision | null;
}

export interface AvailableReviewerResponse {
  id: number;
  firstName: string;
  lastName: string;
}

// ---- Reviewer ----
export interface ReviewCommentRequest {
  reviewId: number;
  versionId: number;
  reviewerId: number;
  comment: string;
}

export interface ReviewCommentResponse {
  commentId: number;
  reviewId?: number | null;
  versionId?: number | null;
  reviewerId: number;
  comment: string;
  createdDate: string;
}

export interface ReviewRecommendationRequest {
  recommendation: ReviewerRecommendation;
}

// ---- Shared / history ----
export interface ReviewHistoryResponse {
  historyId: number;
  action: string;
  performedBy: number;
  remarks: string;
  actionDate: string;
}

export interface ReviewerAssignmentResponse {
  assignmentId: number;
  reviewerId: number;
  assignedByEditorId: number;
  assignmentStatus: AssignmentStatus;
  assignedDate: string;
}
