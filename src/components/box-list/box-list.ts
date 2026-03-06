import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Box } from '../box/box';
import { BoxState } from '../../services/box-state';

/**
 * BoxListComponent
 *
 * Renders the grid of boxes. Knows nothing about selections —
 * it only provides each BoxComponent with its id.
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
  private readonly boxStateService = inject(BoxState);

  // Pulled from service so this component stays thin
  readonly boxIds = this.boxStateService.boxIds;
}
