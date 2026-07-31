import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb" *ngIf="items().length > 1">
      <ng-container *ngFor="let item of items(); let last = last; let i = index">
        <a *ngIf="!last" [routerLink]="item.url" class="breadcrumb__link">{{ item.label }}</a>
        <span *ngIf="last" class="breadcrumb__current">{{ item.label }}</span>
        <mat-icon *ngIf="!last" class="breadcrumb__sep">chevron_right</mat-icon>
      </ng-container>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
    }

    .breadcrumb__link {
      color: var(--text-secondary);
      font-weight: 500;

      &:hover {
        color: var(--color-primary-600);
      }
    }

    .breadcrumb__current {
      color: var(--text-primary);
      font-weight: 600;
    }

    .breadcrumb__sep {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-tertiary);
      margin: 0 2px;
    }
  `]
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.buildBreadcrumbs();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): void {
    const trail: BreadcrumbItem[] = [{ label: 'Home', url: '/' }];
    this.collect(this.activatedRoute.root, '', trail);
    this.items.set(trail);
  }

  private collect(route: ActivatedRoute, parentUrl: string, trail: BreadcrumbItem[]): void {
    const children = route.children;
    if (!children.length) return;

    for (const child of children) {
      const snapshot: ActivatedRouteSnapshot = child.snapshot;
      const segment = snapshot.url.map((s) => s.path).join('/');
      const url = segment ? `${parentUrl}/${segment}` : parentUrl;
      const label = snapshot.data['breadcrumb'] as string | undefined;

      if (label) {
        trail.push({ label, url });
      }

      this.collect(child, url, trail);
    }
  }
}
