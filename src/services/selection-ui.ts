import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';
import { CoffeeId, SLOT_COUNT, type SlotId, type BoxViewModel  } from '../models/options.model';
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

  readonly activeBoxId$: Observable<SlotId | null> =
    this.activeBoxIdSubject.pipe(distinctUntilChanged());

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
          return nextId < SLOT_COUNT ? nextId : slotId;
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
   * Closes the option selector (sets active box to null).
   * @returns void
   */
  clearActiveBox(): void {
    this.activeBoxIdSubject.next(null);
  }

  /**
   * Observable of whether a given coffeeId is selected for the currently active box.
   * Derived from activeBoxId$ and selections$ — component does not need to combine these.
   * @param coffeeId — id of the coffee option to check
   */
  isOptionSelected$(coffeeId: CoffeeId): Observable<boolean> {
    return combineLatest([this.activeBoxId$, this.boxState.selections$]).pipe(
      map(([activeBoxId, selections]) => {
        if (activeBoxId === null) return false;
        return selections[activeBoxId] === coffeeId;
      }),
      distinctUntilChanged(),
      shareReplay(1),
    );
  }

  /**
   * Handles a coffee option click — persists selection via BoxState
   * and emits to optionSelected$ stream for auto-advance.
   * @param coffeeId — id of the selected coffee option
   */
  onOptionClick(coffeeId: CoffeeId): void {
    const activeBoxId = this.activeBoxIdSubject.getValue();
    if (activeBoxId === null) return;
    this.boxState.onOptionSelected(activeBoxId, coffeeId);
  }

  /**
   * Observable view model for a single box slot.
   * Combines selectedOption and isActive into one stream — component does not need to combine these.
   * @param slotId — 0-based slot index
   * @returns Observable<BoxViewModel> — emits on every selection or active box change
   */
  getBoxViewModel$(slotId: SlotId): Observable<BoxViewModel> {
    return combineLatest({
      selectedOption: this.boxState.getSelectedOption$(slotId),
      isActive: this.activeBoxId$.pipe(map((activeId) => activeId === slotId)),
    }).pipe(shareReplay(1));
  }
}
