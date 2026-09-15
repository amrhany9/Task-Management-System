import { Component, Input } from '@angular/core';

/** Gradient logo tile shared by the navbar and the auth screens. */
@Component({
  selector: 'app-brand-mark',
  standalone: true,
  template: `
    <span class="brand-tile" [class]="sizeClasses">
      <svg
        [class]="iconClasses"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 13l2 2 4-4" />
      </svg>
    </span>
  `,
  host: { class: 'inline-flex' }
})
export class BrandMarkComponent {
  @Input() size: 'md' | 'lg' = 'md';

  get sizeClasses(): string {
    return this.size === 'lg' ? 'h-14 w-14 rounded-2xl shadow-xl' : 'h-10 w-10';
  }

  get iconClasses(): string {
    return this.size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  }
}
