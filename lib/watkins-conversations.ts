export const CONVERSATION_TYPES = [
  {
    id: 'situational_diagnosis' as const,
    number: 1,
    title: 'Situational Diagnosis',
    description: 'Understand how your boss (or direct report) sees the STARS portfolio — Start-up, Turnaround, Accelerated Growth, Realignment, or Sustaining Success. How has the organisation reached this point? What are the key challenges and opportunities from their perspective?',
    shortDescription: 'Understand how they see the current situation — challenges, opportunities, and how the organisation got here.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member', 'Peer', 'Senior Stakeholder', 'Client / Customer', 'External Partner', 'Wider Stakeholder', 'Other'],
  },
  {
    id: 'expectations' as const,
    number: 2,
    title: 'Expectations',
    description: 'What are your boss\'s (or this person\'s) expectations of you and your team? Agree on your near-term goals and success criteria. Plan to revisit this monthly as understanding deepens.',
    shortDescription: 'Agree on expectations, goals, and success criteria. Revisit monthly as understanding deepens.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member', 'Peer', 'Senior Stakeholder', 'Client / Customer', 'External Partner', 'Wider Stakeholder', 'Other'],
  },
  {
    id: 'style' as const,
    number: 3,
    title: 'Style',
    description: 'How do you prefer to communicate with one another? What decisions does your boss want to be consulted on? What communication channels, frequency, and format work best? Agreeing on working style early prevents friction later.',
    shortDescription: 'Agree on communication style, channels, frequency, and decision-making boundaries.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member', 'Peer', 'Senior Stakeholder', 'Client / Customer', 'External Partner', 'Wider Stakeholder', 'Other'],
  },
  {
    id: 'strategy_alignment' as const,
    number: 4,
    title: 'Strategy & Alignment',
    description: 'Share your conclusions from the situational diagnosis and any emerging recommendations. This is where you test your strategic thinking with your boss before committing. Typically in month 2, possibly revisited at the start of month 3.',
    shortDescription: 'Share your strategic conclusions and recommendations. Typically month 2, revisited in month 3.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member'],
  },
  {
    id: 'resources' as const,
    number: 5,
    title: 'Resources',
    description: 'What resources — people, budget, tools — do you need to execute your strategy? Present options as a "menu" for your boss to choose from. Typically from day 60 onwards, once strategy is clearer.',
    shortDescription: 'Identify resources needed and present options. Typically from day 60 onwards.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member'],
  },
  {
    id: 'professional_development' as const,
    number: 6,
    title: 'Professional Development',
    description: 'How are you (or this person) doing so far? What skills or knowledge gaps need addressing? Are there special projects or stretch assignments that would help? Typically at the end of month 1 and again at end of month 3.',
    shortDescription: 'Review performance, identify gaps, and plan development. End of month 1 and month 3.',
    applicableTo: ['Boss / Line Manager', 'Direct Report', 'Team Member'],
  },
] as const;

export type ConversationTypeId = typeof CONVERSATION_TYPES[number]['id'];

export function getConversationsForCategory(category: string): typeof CONVERSATION_TYPES[number][] {
  return CONVERSATION_TYPES.filter((c) => c.applicableTo.includes(category as any));
}

export const DEFAULT_ASSESSMENT_CRITERIA = [
  { name: 'Competence', description: 'Technical and functional skills required for the role', defaultWeight: 17, defaultThreshold: 10 },
  { name: 'Judgement', description: 'Quality of decision-making, especially under uncertainty or pressure', defaultWeight: 17, defaultThreshold: 10 },
  { name: 'Energy', description: 'Drive, initiative, and ability to sustain performance', defaultWeight: 17, defaultThreshold: 8 },
  { name: 'Focus', description: 'Ability to prioritise and stay on the most important work', defaultWeight: 17, defaultThreshold: 8 },
  { name: 'Relationships', description: 'Quality of working relationships with colleagues, stakeholders, and team', defaultWeight: 16, defaultThreshold: 8 },
  { name: 'Trust', description: 'Reliability, honesty, and alignment with values — the foundation everything else rests on', defaultWeight: 16, defaultThreshold: 10 },
];
