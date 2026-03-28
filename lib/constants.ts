export const LEADER_LEVELS = [
  { value: 'ic', label: 'First-Time Leader', desc: 'New to leading a team for the first time' },
  { value: 'team_lead', label: 'Team Lead', desc: 'Leading a small team' },
  { value: 'manager', label: 'Manager', desc: 'Managing a team' },
  { value: 'director', label: 'Senior Manager / Director', desc: 'Cross-functional leadership' },
  { value: 'executive', label: 'Executive / C-Suite', desc: 'Senior leadership, board-level' },
] as const;

export type LeaderLevelValue = typeof LEADER_LEVELS[number]['value'];
