import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';

/**
 * Accessible replacement for `window.confirm`: focus moves into the dialog on open,
 * Escape cancels, and the backdrop click cancels.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements AfterViewInit {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Delete';
  @Input() cancelLabel = 'Cancel';
  @Input() isBusy = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('confirmButton') confirmButton?: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    this.confirmButton?.nativeElement.focus();
  }
}
