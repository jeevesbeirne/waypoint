export const WATKINS_GROUPS = [
  'Prepare Yourself',
  'Accelerate Your Learning',
  'Match Strategy to Situation',
  'Negotiate Success',
  'Secure Early Wins',
  'Achieve Alignment',
  'Build Your Team',
  'Create Alliances',
  'Manage Yourself',
  'Accelerate Everyone',
] as const;

export type WatkinsGroup = typeof WATKINS_GROUPS[number];

export const WATKINS_GROUP_COLORS: Record<WatkinsGroup, string> = {
  'Prepare Yourself': '#6366F1',
  'Accelerate Your Learning': '#3B82F6',
  'Match Strategy to Situation': '#8B5CF6',
  'Negotiate Success': '#EC4899',
  'Secure Early Wins': '#10B981',
  'Achieve Alignment': '#F59E0B',
  'Build Your Team': '#EF4444',
  'Create Alliances': '#14B8A6',
  'Manage Yourself': '#6B7280',
  'Accelerate Everyone': '#F97316',
};

export const WATKINS_SUB_ACTIVITIES: Record<WatkinsGroup, string[]> = {
  'Prepare Yourself': [
    'Mental preparation',
    'Research the organisation',
    'Read transition frameworks',
    'Personal logistics',
    'Clear personal plate',
    'Plan Day 1',
    'Set learning agenda',
  ],
  'Accelerate Your Learning': [
    'Stakeholder interviews',
    'Team assessment',
    'Document & data review',
    'Cultural diagnosis',
    'External / market analysis',
    'Observe & listen',
  ],
  'Match Strategy to Situation': [
    'STARS diagnosis',
    'Strategic options review',
    'Situational communication',
    'Adapt leadership style',
  ],
  'Negotiate Success': [
    'Expectations conversation',
    'Resources conversation',
    'Style conversation',
    'Personal development conversation',
    'Check-in meetings',
  ],
  'Secure Early Wins': [
    'Identify win opportunities',
    'Build credibility',
    'Deliver quick win',
    'Communicate wins',
    'Build momentum',
  ],
  'Achieve Alignment': [
    'Vision & mission clarity',
    'Strategic priorities',
    'Org structure review',
    'Metrics & KPIs',
    'Decision rights',
  ],
  'Build Your Team': [
    'Team assessment',
    'Performance conversations',
    'Personnel decisions',
    'Team culture',
    'Team development',
  ],
  'Create Alliances': [
    'Stakeholder mapping',
    'Lateral relationship building',
    'Influence without authority',
    'Coalition building',
    'Political navigation',
  ],
  'Manage Yourself': [
    'Reflection practice',
    'Energy management',
    'Seek advice & mentoring',
    'Decision discipline',
    'Work-life boundaries',
  ],
  'Accelerate Everyone': [
    'Capability building',
    'Knowledge sharing',
    'Coaching & delegation',
    'Succession planning',
  ],
};
