import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { SLOT_COUNT, type SlotId } from '../models/options.model';
import { BoxState } from './box-state';

/**
 * SelectionUi — owns purely UI-level state:
 *  - Which box is currently "active" (showing the option selector)
 *
 * Keeping this separate from BoxState makes the distinction clear:
 * BoxState = persisted domain state
 * SelectionUi = transient UI state
 *
 * All user actions flow in as observables (boxClick$, optionSelected$ from BoxState).
 * Subscriptions in the constructor react to those streams. Both services are
 * providedIn: 'root', so they (and these subscriptions) live for the app lifetime —
 * no leak, no teardown needed.
 */
@Injectable({ providedIn: 'root' })
export class SelectionUi {
  private readonly boxState = inject(BoxState);

  private readonly activeBoxIdSubject = new BehaviorSubject<SlotId | null>(null);

  readonly activeBoxId$: Observable<SlotId | null> = this.activeBoxIdSubject.asObservable();

  /**
   * Stream of box-click events. Box emits here; constructor subscription toggles active box.
   */
  private readonly boxClickSubject = new Subject<SlotId>();
  readonly boxClick$: Observable<SlotId> = this.boxClickSubject.asObservable();

  constructor() {
    // React to box clicks as a stream — toggle active box (or close if same box)
    this.boxClick$
      .pipe(map((slotId) => (this.activeBoxIdSubject.getValue() === slotId ? null : slotId)))
      .subscribe((next) => this.activeBoxIdSubject.next(next));

    // React to option selections — auto-advance to next box (or stay on the same box if last box)
    this.boxState.optionSelected$
      .pipe(
        map(({ slotId }) => {
          const nextId = slotId + 1;
          return nextId < SLOT_COUNT? nextId : slotId;
        }),
      )
      .subscribe((next) => this.activeBoxIdSubject.next(next));
  }

  /**
   * Called by Box when a box is clicked. Pushes into boxClick$; constructor handles toggle.
   * @param slotId — 0-based box index
   * @returns void
   */
  onBoxClick(slotId: SlotId): void {
    this.boxClickSubject.next(slotId);
  }

  /**
   * Synchronous snapshot of the current active box id. Use only in event handlers, not in pipelines.
   * @returns BoxId of active box, or null if none
   */
  getActiveBoxIdSnapshot(): SlotId | null {
    return this.activeBoxIdSubject.getValue();
  }

  /**
   * Closes the option selector (sets active box to null).
   * @returns void
   */
  clearActiveBox(): void {
    this.activeBoxIdSubject.next(null);
  }
}
