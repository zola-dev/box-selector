import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs';
import {
  BOX_COUNT,
  OPTIONS,
  Option,
  OptionSelectionEvent,
  type BoxId,
  type OptionId,
  type SelectionsMap,
  STORAGE_KEY,
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
  private readonly selectionsSubject = new BehaviorSubject<SelectionsMap>(this.loadFromStorage());

  readonly selections$: Observable<SelectionsMap> = this.selectionsSubject.asObservable();

  // The static list of all available options
  readonly options: Option[] = OPTIONS;

  /** Box ids 0..BOX_COUNT-1 for iteration in templates. */
  readonly boxIds: readonly BoxId[] = Array.from({ length: BOX_COUNT }, (_, i) => i) as BoxId[];
  /**
   * Stream of option selections. OptionItem emits here; this service persists,
   * and SelectionUi subscribes to auto-advance the active box.
   */
  private readonly optionSelectedSubject = new Subject<OptionSelectionEvent>();
  readonly optionSelected$: Observable<OptionSelectionEvent> =
    this.optionSelectedSubject.asObservable();

  constructor() {
    // providedIn: 'root' → singleton for app lifetime; this subscription needs no teardown.
    this.optionSelected$
      .pipe(
        tap(({ boxId, optionId }) => {
          const updated = { ...this.selectionsSubject.getValue(), [boxId]: optionId };
          this.selectionsSubject.next(updated);
          this.saveToStorage(updated);
        }),
      )
      .subscribe();
  }

  /**
   * Called by OptionItem when an option is clicked.
   * Emits to optionSelected$; constructor subscription persists, SelectionUi advances.
   * @param boxId — 0-based box index
   * @param optionId — id of the selected option
   */
  onOptionSelected(boxId: BoxId, optionId: OptionId): void {
    this.optionSelectedSubject.next({ boxId, optionId } satisfies OptionSelectionEvent);
  }

  /**
   * Observable of the selected option id for a specific box, or null if none.
   * @param boxId — 0-based box index
   * @returns Observable<OptionId | null>
   */
  getSelectionForBox$(boxId: BoxId): Observable<OptionId | null> {
    return this.selections$.pipe(map((selections) => selections[boxId] ?? null));
  }

  /**
   * Observable of the full Option for a box, or null if none selected.
   * @param boxId — 0-based box index
   * @returns Observable<Option | null>
   */
  getSelectedOption$(boxId: BoxId): Observable<Option | null> {
    return this.getSelectionForBox$(boxId).pipe(
      map((optionId) => (optionId ? (this.options.find((o) => o.id === optionId) ?? null) : null)),
    );
  }

  /**
   * Clears all box selections and persists empty state to localStorage.
   * @returns void
   */
  clearAll(): void {
    const empty: SelectionsMap = {};
    this.selectionsSubject.next(empty);
    this.saveToStorage(empty);
  }

  // ---------------------------------------------------------------------------
  // Private helpers — localStorage persistence
  // ---------------------------------------------------------------------------

  private loadFromStorage(): SelectionsMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      // If storage is unavailable or corrupted, start fresh
      return {};
    }
  }

  private saveToStorage(state: SelectionsMap): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore storage errors (e.g. private browsing quota)
    }
  }

  /** Sum of scores of all currently selected options (derived from selections$). */
  readonly totalScore$: Observable<number> = this.selections$.pipe(
    map((selections) => {
      return Object.values(selections)
        .filter((optionId): optionId is string => optionId !== null)
        .reduce((sum, optionId) => {
          const option = this.options.find((o) => o.id === optionId);
          return sum + (option?.score ?? 0);
        }, 0);
    }),
  );
}
