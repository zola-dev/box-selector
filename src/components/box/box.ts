import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { SelectionUi } from '../../services/selection-ui';
import { type SlotId, CoffeeOption } from '../../models/options.model';

interface BoxViewModel {
  selectedOption: CoffeeOption | null;
  isActive: boolean;
}

/**
 * Single selectable box in the grid. Input: slotId only; state derived from BoxState and SelectionUi.
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
  @Input({ required: true }) slotId!: SlotId;
  private readonly selectionUiService = inject(SelectionUi);
  vm$!: Observable<BoxViewModel>;

  ngOnInit(): void {
    this.vm$ = this.selectionUiService.getBoxViewModel$(this.slotId);
  }

  /**
   * Forward click to the UI service — no @Output needed.
   * The service manages the active-box toggle logic.
   */
  onBoxClick(): void {
    this.selectionUiService.onBoxClick(this.slotId);
  }
}
