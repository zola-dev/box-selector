import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { map } from 'rxjs';
import { BoxList } from './components/box-list/box-list';
import { OptionSelector } from './components/option-selector/option-selector';
import { BoxState } from './services/box-state';
import { SelectionUi } from './services/selection-ui';

  /**
   * Root shell: box grid, option selector panel, and clear button.
   * All state and logic live in services; this component only wires template to observables.
   */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DecimalPipe, BoxList, OptionSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly boxState = inject(BoxState);
  private readonly selectionUi = inject(SelectionUi);

  readonly totalScore$ = this.boxState.totalScore$;

  /** Drives @if for option selector visibility (true when a box is active). */
  readonly hasActiveBox$ = this.selectionUi.activeBoxId$.pipe(map((id) => id !== null));

  /** Clears all box selections (BoxState) and closes the option selector (SelectionUi). */
  onClearAll(): void {
    this.boxState.clearAll();
    this.selectionUi.clearActiveBox();
  }
}
