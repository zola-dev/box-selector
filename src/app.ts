import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BoxList } from './components/box-list/box-list';
import { OptionSelector } from './components/option-selector/option-selector';
import { BoxState } from './services/box-state';
import { SelectionUi } from './services/selection-ui';

/**
 * App
 *
 * Contains the box grid, option selector panel, and clear button.
 *
 * All state lives in SignalStores (BoxState, SelectionUi).
 * Signals are read directly in the template via ().
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, BoxList, OptionSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly boxState = inject(BoxState);
  readonly selectionUi = inject(SelectionUi);

  /**
   * Clears all slot selections (BoxState) and closes the option selector (SelectionUi).
   * @returns void
   */
  onClearAll(): void {
    this.boxState.clearAll();
    this.selectionUi.clearActiveSlot();
  }
}
