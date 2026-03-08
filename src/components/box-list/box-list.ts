import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Box } from '../box/box';
import { BoxState } from '../../services/box-state';

/**
 * BoxList
 *
 * Renders the grid of coffee order slots.
 * Provides each Box with its slotId — all state comes from BoxState signal store.
 * BoxIds is a computed signal read directly.
 */
@Component({
  selector: 'app-box-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Box],
  templateUrl: './box-list.html',
  styleUrls: ['./box-list.css'],
})
export class BoxList {
  private readonly boxState = inject(BoxState);

  /**
   * Slot ids 0..SLOT_COUNT-1 for iteration in the template.
   * Read from BoxState computed signal.
   */
  readonly boxIds = this.boxState.boxIds;
}
