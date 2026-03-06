import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
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
  template: `
    @if (vm$ | async; as vm) {
      <div
        class="box"
        [class.box--active]="vm.isActive"
        [class.box--selected]="vm.selectedOption !== null"
        (click)="onBoxClick()"
        role="button"
        [attr.aria-pressed]="vm.isActive"
        [attr.aria-label]="'Box ' + (boxId + 1) + (vm.selectedOption ? ': ' + vm.selectedOption.label : '')"
      >
        <span class="box__number">{{ boxId + 1 }}</span>
        @if (vm.selectedOption) {
          <span class="box__label">{{ vm.selectedOption.label }}</span>
        }
      </div>
    }
  `,
  styles: [
    `
    .box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border: 2px solid #ccc;
      border-radius: 8px;
      cursor: pointer;
      background: #fff;
      transition: all 0.15s ease;
      gap: 4px;
    }
    .box:hover { border-color: #888; background: #f5f5f5; }
    .box--active { border-color: #3b82f6; background: #eff6ff; }
    .box--selected { border-color: #10b981; }
    .box--active.box--selected { border-color: #3b82f6; }
    .box__number { font-size: 12px; color: #6b7280; }
    .box__label { font-size: 13px; font-weight: 600; color: #111827; text-align: center; }
  `,
  ],
})
export class Box implements OnInit {
  @Input({ required: true }) boxId!: number;

  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);

  // Combined view model — single async pipe in the template
  vm$!: Observable<BoxViewModel>;

  ngOnInit(): void {
    this.vm$ = combineLatest({
      selectedOption: this.boxStateService.getSelectedOption$(this.boxId),
      isActive: this.selectionUiService.activeBoxId$.pipe(
        map((activeId) => activeId === this.boxId)
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
