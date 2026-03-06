// Represents a single selectable option
export interface Option {
  id: string;
  label: string;
  value: string;
}

// 20 made-up options with meaningful labels and values
export const OPTIONS: Option[] = [
  { id: 'opt-1', label: 'Alpha', value: 'alpha' },
  { id: 'opt-2', label: 'Beta', value: 'beta' },
  { id: 'opt-3', label: 'Gamma', value: 'gamma' },
  { id: 'opt-4', label: 'Delta', value: 'delta' },
  { id: 'opt-5', label: 'Epsilon', value: 'epsilon' },
  { id: 'opt-6', label: 'Zeta', value: 'zeta' },
  { id: 'opt-7', label: 'Eta', value: 'eta' },
  { id: 'opt-8', label: 'Theta', value: 'theta' },
  { id: 'opt-9', label: 'Iota', value: 'iota' },
  { id: 'opt-10', label: 'Kappa', value: 'kappa' },
  { id: 'opt-11', label: 'Lambda', value: 'lambda' },
  { id: 'opt-12', label: 'Mu', value: 'mu' },
  { id: 'opt-13', label: 'Nu', value: 'nu' },
  { id: 'opt-14', label: 'Xi', value: 'xi' },
  { id: 'opt-15', label: 'Omicron', value: 'omicron' },
  { id: 'opt-16', label: 'Pi', value: 'pi' },
  { id: 'opt-17', label: 'Rho', value: 'rho' },
  { id: 'opt-18', label: 'Sigma', value: 'sigma' },
  { id: 'opt-19', label: 'Tau', value: 'tau' },
  { id: 'opt-20', label: 'Upsilon', value: 'upsilon' },
];

// Total number of boxes in the grid
export const BOX_COUNT = 10;

// localStorage key for persisting state
export const STORAGE_KEY = 'box-selector-state';
