/** 0-based index of a box in the grid (0..BOX_COUNT-1). */
export type BoxId = number;

/** Id of an option (e.g. 'opt-1'). Used as value in selections map. */
export type OptionId = string;

/** Map from box id to selected option id (or null). Persisted to localStorage. */
export type SelectionsMap = Record<BoxId, OptionId | null>;

/** A single selectable option (label, value, and score for aggregation). */
export interface Option {
  id: OptionId;
  label: string;
  value: string;
  score: number;
}

/** Payload emitted on optionSelected$ when the user picks an option for a box. */
export interface OptionSelectionEvent {
  boxId: BoxId;
  optionId: OptionId;
}

export const OPTIONS: Option[] = [
  { id: 'opt-1',  label: 'Alpha',   value: 'alpha',   score: 1.1 },
  { id: 'opt-2',  label: 'Beta',    value: 'beta',    score: 1.3 },
  { id: 'opt-3',  label: 'Gamma',   value: 'gamma',   score: 1.5 },
  { id: 'opt-4',  label: 'Delta',   value: 'delta',   score: 1.7 },
  { id: 'opt-5',  label: 'Epsilon', value: 'epsilon', score: 1.9 },
  { id: 'opt-6',  label: 'Zeta',    value: 'zeta',    score: 2.1 },
  { id: 'opt-7',  label: 'Eta',     value: 'eta',     score: 2.3 },
  { id: 'opt-8',  label: 'Theta',   value: 'theta',   score: 2.5 },
  { id: 'opt-9',  label: 'Iota',    value: 'iota',    score: 2.7 },
  { id: 'opt-10', label: 'Kappa',   value: 'kappa',   score: 2.9 },
  { id: 'opt-11', label: 'Lambda',  value: 'lambda',  score: 3.1 },
  { id: 'opt-12', label: 'Mu',      value: 'mu',      score: 3.3 },
  { id: 'opt-13', label: 'Nu',      value: 'nu',      score: 3.5 },
  { id: 'opt-14', label: 'Xi',      value: 'xi',      score: 3.7 },
  { id: 'opt-15', label: 'Omicron', value: 'omicron', score: 3.9 },
  { id: 'opt-16', label: 'Pi',      value: 'pi',      score: 4.1 },
  { id: 'opt-17', label: 'Rho',     value: 'rho',     score: 4.3 },
  { id: 'opt-18', label: 'Sigma',   value: 'sigma',   score: 4.5 },
  { id: 'opt-19', label: 'Tau',     value: 'tau',     score: 4.7 },
  { id: 'opt-20', label: 'Upsilon', value: 'upsilon', score: 4.9 },
];

/** Number of boxes in the grid (0-based ids: 0..BOX_COUNT-1). */
export const BOX_COUNT = 10;

/** localStorage key for persisting box → option selections. */
export const STORAGE_KEY = 'box-selector-state';
