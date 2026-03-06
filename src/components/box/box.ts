import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { Option } from '../../models/options.model';

interface BoxViewModel {
  selectedOption: Option | null;
  isActive: boolean;
}

/**
 * BoxComponent
 *
 * Represents a single selectable box in the grid.
 *
 * Receives only its `boxId` as input — all state is derived
 * from services using that id. No outputs are emitted; clicks
 * are forwarded directly to SelectionUiService.
 */
@Component({
  selector: 'app-box',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  templateUrl: './box.html',
  styleUrls: ['./box.css'],
})
export class Box implements OnInit {
  @Input({ required: true }) boxId!: number;
  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);
  vm$!: Observable<BoxViewModel>;

  ngOnInit(): void {
    this.vm$ = combineLatest({
      selectedOption: this.boxStateService.getSelectedOption$(this.boxId),
      isActive: this.selectionUiService.activeBoxId$.pipe(
        map((activeId) => activeId === this.boxId),
      ),
    });
  }

  /**
   * Forward click to the UI service — no @Output needed.
   * The service manages the active-box toggle logic.
   */
  onBoxClick(): void {
    this.selectionUiService.onBoxClick(this.boxId);
  }
}
