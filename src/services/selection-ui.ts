import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { BOX_COUNT, type BoxId } from '../models/options.model';
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

  private readonly activeBoxIdSubject = new BehaviorSubject<BoxId | null>(null);

  readonly activeBoxId$: Observable<BoxId | null> = this.activeBoxIdSubject.asObservable();

  /**
   * Stream of box-click events. Box emits here; constructor subscription toggles active box.
   */
  private readonly boxClickSubject = new Subject<BoxId>();
  readonly boxClick$: Observable<BoxId> = this.boxClickSubject.asObservable();

  constructor() {
    // React to box clicks as a stream — toggle active box (or close if same box)
    this.boxClick$
      .pipe(map((boxId) => (this.activeBoxIdSubject.getValue() === boxId ? null : boxId)))
      .subscribe((next) => this.activeBoxIdSubject.next(next));

    // React to option selections — auto-advance to next box (or close if last box)
    this.boxState.optionSelected$
      .pipe(
        map(({ boxId }) => {
          const nextId = boxId + 1;
          return nextId < BOX_COUNT ? nextId : null;
        }),
      )
      .subscribe((next) => this.activeBoxIdSubject.next(next));
  }

  /**
   * Called by Box when a box is clicked. Pushes into boxClick$; constructor handles toggle.
   * @param boxId — 0-based box index
   * @returns void
   */
  onBoxClick(boxId: BoxId): void {
    this.boxClickSubject.next(boxId);
  }

  /**
   * Synchronous snapshot of the current active box id. Use only in event handlers, not in pipelines.
   * @returns BoxId of active box, or null if none
   */
  getActiveBoxIdSnapshot(): BoxId | null {
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
