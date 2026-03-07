import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Box } from '../box/box';
import { BoxState } from '../../services/box-state';

/**
 * Renders the grid of boxes. Provides each Box with its id; state comes from BoxState.
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
