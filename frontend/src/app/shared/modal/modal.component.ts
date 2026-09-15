import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * General-purpose dialog for create/update forms.
 *
 * Separate from ConfirmDialogComponent, which is a role="alertdialog" built
 * specifically for destructive confirmation.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html'
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  /** Blocks closing while a submit is in flight, so a request can't be orphaned. */
  @Input() isBusy = false;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  private previouslyFocused: HTMLElement | null = null;

  get sizeClass(): string {
    const sizes: Record<ModalSize, string> = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };
    return sizes[this.size];
  }

  ngAfterViewInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first control so keyboard users land inside the dialog.
    const focusable = this.panel?.nativeElement.querySelector<HTMLElement>(
      'input, select, textarea, button:not([disabled])'
    );
    focusable?.focus();

    document.body.classList.add('overflow-hidden');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('overflow-hidden');
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.requestClose();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.requestClose();
    }
  }

  requestClose(): void {
    if (!this.isBusy) {
      this.closed.emit();
    }
  }

  /** Keeps Tab focus inside the dialog while it is open. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.panel) {
      return;
    }

    const focusable = Array.from(
      this.panel.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
