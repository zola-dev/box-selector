import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { BOX_COUNT, OPTIONS, Option, STORAGE_KEY } from '../models/options.model';

/**
 * BoxStateService
 *
 * Single source of truth for:
 *  - Which option is selected per box (persisted to localStorage)
 *  - The full list of available options
 *
 * All state is exposed as observables so components can subscribe
 * reactively via the async pipe without any manual change detection.
 */
@Injectable({ providedIn: 'root' })
export class BoxState {
  // Map of boxId (0-based index) → selected optionId or null
  private readonly selectionsSubject = new BehaviorSubject<Record<number, string | null>>(
    this.loadFromStorage(),
  );

  // Public stream — components subscribe to this
  readonly selections$: Observable<Record<number, string | null>> =
    this.selectionsSubject.asObservable();

  // The static list of all available options
  readonly options: Option[] = OPTIONS;

  // Derived: box ids array (0..BOX_COUNT-1) for iteration in templates
  readonly boxIds: number[] = Array.from({ length: BOX_COUNT }, (_, i) => i);

  /**
   * Returns an observable of the selected optionId for a specific box.
   * Components use this with their own boxId to get only what they need.
   */
  getSelectionForBox$(boxId: number): Observable<string | null> {
    return this.selections$.pipe(map((selections) => selections[boxId] ?? null));
  }

  /**
   * Returns an observable of the full Option object selected for a box,
   * or null if nothing is selected.
   */
  getSelectedOption$(boxId: number): Observable<Option | null> {
    return this.getSelectionForBox$(boxId).pipe(
      map((optionId) => (optionId ? (this.options.find((o) => o.id === optionId) ?? null) : null)),
    );
  }

  /**
   * Set the selected option for a given box.
   * Persists the new state to localStorage after every change.
   */
  setSelection(boxId: number, optionId: string): void {
    const current = this.selectionsSubject.getValue();
    const updated = { ...current, [boxId]: optionId };
    this.selectionsSubject.next(updated);
    this.saveToStorage(updated);
  }

  /**
   * Clear all selections across all boxes.
   */
  clearAll(): void {
    const empty: Record<number, string | null> = {};
    this.selectionsSubject.next(empty);
    this.saveToStorage(empty);
  }

  // ---------------------------------------------------------------------------
  // Private helpers — localStorage persistence
  // ---------------------------------------------------------------------------

  private loadFromStorage(): Record<number, string | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      // If storage is unavailable or corrupted, start fresh
      return {};
    }
  }

  private saveToStorage(state: Record<number, string | null>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore storage errors (e.g. private browsing quota)
    }
  }

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
