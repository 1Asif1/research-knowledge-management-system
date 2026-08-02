import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ReviewPaperComponent } from './review-paper.component';
import { PaperService } from '@core/services/paper.service';
import { ReviewerService } from '@core/services/reviewer.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ReviewerRecommendation, ReviewStatus } from '@core/models';

describe('ReviewPaperComponent', () => {
  const paperServiceSpy = jasmine.createSpyObj<PaperService>('PaperService', [
    'downloadPaperPdfForReviewer',
    'downloadCurrentPaperPdfForReviewer'
  ]);
  const reviewerServiceSpy = jasmine.createSpyObj<ReviewerService>('ReviewerService', [
    'getAssignedReviews',
    'addComment',
    'submitRecommendation',
    'getComments'
  ]);
  const tokenStorageSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
    'getUser'
  ]);
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', [
    'bypassSecurityTrustResourceUrl'
  ]);

  beforeEach(async () => {
    paperServiceSpy.downloadPaperPdfForReviewer.calls.reset();
    paperServiceSpy.downloadCurrentPaperPdfForReviewer.calls.reset();
    reviewerServiceSpy.getAssignedReviews.calls.reset();
    reviewerServiceSpy.addComment.calls.reset();
    reviewerServiceSpy.submitRecommendation.calls.reset();
    reviewerServiceSpy.getComments.calls.reset();
    tokenStorageSpy.getUser.and.returnValue({ id: 7 } as never);
    sanitizerSpy.bypassSecurityTrustResourceUrl.and.callFake((value: string) => value as never);

    await TestBed.configureTestingModule({
      imports: [ReviewPaperComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: Router, useValue: routerSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PaperService, useValue: paperServiceSpy },
        { provide: ReviewerService, useValue: reviewerServiceSpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy }
      ]
    }).compileComponents();
  });

  it('loads the current version number for PDF download', () => {
    const fixture = TestBed.createComponent(ReviewPaperComponent);
    const component = fixture.componentInstance;
    const pdfResponse = new HttpResponse({
      body: new Blob(['pdf'], { type: 'application/pdf' }),
      headers: new HttpHeaders({ 'content-type': 'application/pdf' })
    });

    component.review.set({
      reviewId: 5,
      paperId: 9,
      paperTitle: 'Paper',
      editorId: 1,
      reviewerId: 7,
      currentVersion: 3,
      currentVersionId: 12,
      reviewStatus: ReviewStatus.REVIEWER_ASSIGNED,
      reviewerRecommendation: null,
      editorDecision: null
    });

    paperServiceSpy.downloadPaperPdfForReviewer.and.returnValue(of(pdfResponse.body!));

    component.loadVersionContent();

    expect(paperServiceSpy.downloadPaperPdfForReviewer).toHaveBeenCalledWith(9, 3, true);
  });

  it('invalidates comments shorter than 20 characters after trimming', () => {
    const fixture = TestBed.createComponent(ReviewPaperComponent);
    const component = fixture.componentInstance;

    component.commentForm.controls.comment.setValue('   too short   ');

    expect(component.commentForm.invalid).toBeTrue();
    expect(component.commentForm.controls.comment.hasError('minlength')).toBeTrue();
  });
});
