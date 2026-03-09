import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs';
import {
  SLOT_COUNT,
  COFFEE_OPTIONS,
  CoffeeOption,
  CoffeeSelectionEvent,
  type SlotId,
  type CoffeeId,
  STORAGE_KEY,
  OrderMap,
} from '../models/options.model';

/**
 * BoxState — single source of truth for:
 *  - Which option is selected per box (persisted to localStorage)
 *  - The full list of available options
 *
 * All state is exposed as observables so components can subscribe
 * reactively via the async pipe without any manual change detection.
 */
@Injectable({ providedIn: 'root' })
export class BoxState {
  private readonly selectionsSubject = new BehaviorSubject<OrderMap>(this.loadFromStorage());

  readonly selections$: Observable<OrderMap> = this.selectionsSubject.asObservable();

  // The static list of all available options
  readonly options: CoffeeOption[] = COFFEE_OPTIONS;

  /** Box ids 0..BOX_COUNT-1 for iteration in templates. */
  readonly boxIds: readonly SlotId[] = Array.from({ length: SLOT_COUNT }, (_, i) => i) as SlotId[];
  /**
   * Stream of option selections. OptionItem emits here; this service persists,
   * and SelectionUi subscribes to auto-advance the active box.
   */
  private readonly optionSelectedSubject = new Subject<CoffeeSelectionEvent>();
  readonly optionSelected$: Observable<CoffeeSelectionEvent> =
    this.optionSelectedSubject.asObservable();
  /** O(1) lookup map from coffeeId → CoffeeOption. Avoids repeated O(n) find calls. */
  private readonly optionMap = new Map(COFFEE_OPTIONS.map((o) => [o.id, o]));
  /**
   * Pure reducer — returns a new OrderMap with the given slot updated.
   * No side effects; all persistence is handled by the caller.
   */
  private updateSelection(slotId: SlotId, coffeeId: CoffeeId): OrderMap {
    return { ...this.selectionsSubject.getValue(), [slotId]: coffeeId };
  }
  
  constructor() {
    // providedIn: 'root' → singleton for app lifetime; this subscription needs no teardown.
    this.optionSelected$
      .pipe(
        tap(({ slotId, coffeeId }) => {
          const updated = this.updateSelection(slotId, coffeeId);
          this.selectionsSubject.next(updated);
          this.saveToStorage(updated);
        }),
      )
      .subscribe();
  }

  /**
   * Called by OptionItem when an option is clicked.
   * Emits to optionSelected$; constructor subscription persists, SelectionUi advances.
   * @param slotId — 0-based box index
   * @param coffeeId — id of the selected option
   */
  onOptionSelected(slotId: SlotId, coffeeId: CoffeeId): void {
    this.optionSelectedSubject.next({ slotId, coffeeId } satisfies CoffeeSelectionEvent);
  }

  /**
   * Observable of the selected option id for a specific box, or null if none.
   * @param slotId — 0-based box index
   * @returns Observable<OptionId | null>
   */
  getSelectionForBox$(slotId: SlotId): Observable<CoffeeId | null> {
    return this.selections$.pipe(map((selections) => selections[slotId] ?? null));
  }

  /**
   * Observable of the full CoffeeOption for a box, or null if none selected.
   * @param slotId — 0-based box index
   * @returns Observable<CoffeeOption | null>
   */
  getSelectedOption$(slotId: SlotId): Observable<CoffeeOption | null> {
    return this.getSelectionForBox$(slotId).pipe(
      map((coffeeId) => (coffeeId ? (this.optionMap.get(coffeeId) ?? null) : null)),
    );
  }

  /**
   * Clears all box selections and persists empty state to localStorage.
   * @returns void
   */
  clearAll(): void {
    const empty: OrderMap = {};
    this.selectionsSubject.next(empty);
    this.saveToStorage(empty);
  }

  // ---------------------------------------------------------------------------
  // Private helpers — localStorage persistence
  // ---------------------------------------------------------------------------

  private loadFromStorage(): OrderMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      // If storage is unavailable or corrupted, start fresh
      return {};
    }
  }

  private saveToStorage(state: OrderMap): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore storage errors
    }
  }

  /** Sum of scores of all currently selected options (derived from selections$). */
  readonly totalScore$: Observable<number> = this.selections$.pipe(
    map((selections) =>
      Object.values(selections)
        .filter((coffeeId): coffeeId is string => coffeeId !== null)
        .reduce((sum, coffeeId) => sum + (this.optionMap.get(coffeeId)?.score ?? 0), 0),
    ),
  );
}
