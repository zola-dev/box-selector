import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { type SlotId } from '../../models/options.model';

/**
 * Box
 *
 * Single selectable slot in the coffee order grid.
 *
 * Receives only its `slotId` as a signal input — all state is derived
 * from SignalStores using that id — signals are read directly in the template.
 *
 * Clicks are forwarded to SelectionUi.onBoxClick.
 */
@Component({
  selector: 'app-box',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './box.html',
  styleUrls: ['./box.css'],
})
export class Box {
  /** Signal input — replaces @Input() as required by the assignment for the signals version. */
  readonly slotId = input.required<SlotId>();

  private readonly boxState = inject(BoxState);
  private readonly selectionUi = inject(SelectionUi);

  /**
   * The coffee option currently selected for this slot, or null if none.
   * Recomputes automatically when selections change.
   */
  readonly selectedOption = computed(() => this.boxState.getSelectedOption(this.slotId()));

  /**
   * Whether this slot is currently active (showing the option selector).
   * Recomputes automatically when activeSlotId changes.
   */
  readonly isActive = computed(() => this.selectionUi.activeSlotId() === this.slotId());

  /**
   * Forwards the click to SelectionUi.
   * SelectionUi handles the toggle logic (open/close selector).
   * @returns void
   */
  onBoxClick(): void {
    this.selectionUi.onBoxClick(this.slotId());
  }
}
