import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="summary-card" [routerLink]="route()">
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      <small *ngIf="meta()">{{ meta() }}</small>
    </a>
  `,
  styles: [`
    .summary-card {
      display: block;
      text-decoration: none;
      border: 1px solid #dbe1ec;
      background: #fff;
      border-radius: 12px;
      padding: 18px 20px;
      min-height: 154px;
      color: #10284b;
    }

    .summary-card h3 {
      margin: 0 0 10px;
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.25;
      color: #0f2749;
    }

    .summary-card p {
      margin: 0;
      color: #3e506d;
      font-size: 14px;
      line-height: 1.45;
    }

    .summary-card small {
      margin-top: 8px;
      display: block;
      color: #3e506d;
      font-size: 14px;
    }
  `]
})
export class SummaryCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  meta = input<string>('');
  route = input.required<string>();
}
