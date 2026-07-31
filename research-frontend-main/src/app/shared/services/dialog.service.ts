import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

// Thin wrapper so every page can do:
//   this.dialogService.confirm({ title, message }).subscribe(ok => { if (ok) {...} })
// instead of repeating MatDialog boilerplate everywhere.
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data,
      width: '420px',
      autoFocus: false
    });

    return ref.afterClosed() as Observable<boolean>;
  }
}
