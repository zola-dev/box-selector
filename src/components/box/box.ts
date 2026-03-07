import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { type BoxId, Option } from '../../models/options.model';

interface BoxViewModel {
  selectedOption: Option | null;
  isActive: boolean;
}

/**
 * Single selectable box in the grid. Input: boxId only; state derived from BoxState and SelectionUi.
 * Clicks go to SelectionUi.onBoxClick (no @Output).
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
  @Input({ required: true }) boxId!: BoxId;
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
