import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-module-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="module-header">
      <p class="module-header__module">{{ module() }}</p>
      <h2 class="module-header__title">{{ title() }}</h2>
    </section>
  `,
  styles: [`
    .module-header {
      padding: 2px 0 18px;
      border-bottom: 1px solid #e3e7ef;
      margin-bottom: 20px;
    }

    .module-header__module {
      margin: 0 0 10px;
      color: #c18600;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .module-header__title {
      margin: 0;
      font-family: 'Source Serif 4', Georgia, serif;
      color: #0d2547;
      font-size: 46px;
      font-weight: 600;
      line-height: 1.2;
    }
  `]
})
export class ModuleHeaderComponent {
  module = input.required<string>();
  title = input.required<string>();
}
