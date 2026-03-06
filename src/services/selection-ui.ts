import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BOX_COUNT } from '../models/options.model';

/**
 * SelectionUiService
 *
 * Owns purely UI-level state:
 *  - Which box is currently "active" (showing the option selector)
 *
 * Keeping this separate from BoxStateService makes the distinction clear:
 * BoxStateService = persisted domain state
 * SelectionUiService = transient UI state
 */
@Injectable({ providedIn: 'root' })
export class SelectionUi {
  // The currently active box id, or null if no box is selected
  private readonly activeBoxIdSubject = new BehaviorSubject<number | null>(
    null
  );

  readonly activeBoxId$: Observable<number | null> =
    this.activeBoxIdSubject.asObservable();

  /**
   * Subject used to stream box-click events.
   * BoxComponent emits here instead of using @Output EventEmitters,
   * so we can compose this stream reactively anywhere in the app.
   */
  private readonly boxClickSubject = new Subject<number>();
  readonly boxClick$: Observable<number> = this.boxClickSubject.asObservable();

  /**
   * Called by BoxComponent when a box is clicked.
   * Toggles the active box: clicking the already-active box closes the selector.
   */
  onBoxClick(boxId: number): void {
    const current = this.activeBoxIdSubject.getValue();
    const next = current === boxId ? null : boxId;
    this.activeBoxIdSubject.next(next);
    this.boxClickSubject.next(boxId);
  }

  /**
   * Synchronous snapshot of the current active box id.
   * Only use this in response to user events (clicks), never in reactive pipelines.
   * BehaviorSubject.getValue() is safe here — we need a point-in-time value.
   */
  getActiveBoxIdSnapshot(): number | null {
    return this.activeBoxIdSubject.getValue();
  }

  /**
   * to automatically advance focus to the next box.
   */
  advanceToNextBox(currentBoxId: number): void {
    const nextId = currentBoxId + 1;
    // If we're past the last box, close the selector
    const next = nextId < BOX_COUNT ? nextId : null;
    this.activeBoxIdSubject.next(next);
  }

  /**
   * Close the option selector (no active box).
   */
  clearActiveBox(): void {
    this.activeBoxIdSubject.next(null);
  }
}
