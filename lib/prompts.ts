export type Phase = 'learn' | 'build' | 'deliver';

interface Prompt {
  day: number;
  phase: Phase;
  text: string;
  category: string;
}

export const dailyPrompts: Prompt[] = [
  // Phase 1: Learn & Listen (Days 1-30) — original prompts retained
  { day: 1, phase: 'learn', text: "What's your first impression of the culture here — and what's driving that impression?", category: 'culture' },
  { day: 2, phase: 'learn', text: "What's one thing you observed today that surprised you?", category: 'observation' },
  { day: 3, phase: 'learn', text: "Who holds informal influence in your organisation — someone who isn't in a formal leadership role?", category: 'stakeholders' },
  { day: 4, phase: 'learn', text: "What cultural norm did you notice today — and does it help or hinder the organisation?", category: 'culture' },
  { day: 5, phase: 'learn', text: "Who haven't you met yet that you should? What's stopping you?", category: 'relationships' },
  { day: 6, phase: 'learn', text: "What assumptions are you bringing from your last role that might not apply here?", category: 'self-awareness' },
  { day: 7, phase: 'learn', text: "Reflect on your first week. What are the three things you most need to learn in the next two weeks?", category: 'planning' },
  { day: 8, phase: 'learn', text: "What's the real challenge this organisation is facing — underneath the stated challenge?", category: 'diagnosis' },
  { day: 9, phase: 'learn', text: "What would your predecessor say you need to understand about this role?", category: 'context' },
  // Principle 2 (Accelerate Learning) — days 10-18
  { day: 10, phase: 'learn', text: "What is the single most important thing you still don't understand about how this organisation really works?", category: 'learning' },
  { day: 11, phase: 'learn', text: "Whose perspective have you not yet sought — and why not?", category: 'learning' },
  { day: 12, phase: 'learn', text: "What are you hearing repeatedly across different conversations, and what might that signal?", category: 'learning' },
  { day: 13, phase: 'learn', text: "What one thing, if you had known it on day one, would have changed how you approached the past week?", category: 'learning' },
  { day: 14, phase: 'learn', text: "Are you learning from the right people, or defaulting to those who are most accessible or most senior?", category: 'learning' },
  { day: 15, phase: 'learn', text: "What quick wins could you deliver without overstepping before you fully understand the context?", category: 'wins' },
  { day: 16, phase: 'learn', text: "How do people prefer to communicate here — what's the unwritten code?", category: 'culture' },
  { day: 17, phase: 'learn', text: "What's the situation you've inherited — Startup, Turnaround, Growth, Realignment, or Sustaining success?", category: 'diagnosis' },
  { day: 18, phase: 'learn', text: "What questions haven't you asked yet that you know you should?", category: 'self-awareness' },
  // Principle 3 (Match Strategy to Situation) — days 19-27
  { day: 19, phase: 'learn', text: "If you had to characterise the single most pressing organisational need right now — not what's on the strategy document, but what you're actually observing — what would it be?", category: 'situation' },
  { day: 20, phase: 'learn', text: "Does your instinctive leadership approach fit the situation you've diagnosed, or are you fighting your own defaults?", category: 'situation' },
  { day: 21, phase: 'learn', text: "Are the people around you accurately describing the situation, or are there signs they are in denial about how serious (or good) it is?", category: 'situation' },
  { day: 22, phase: 'learn', text: "Where is the most significant mismatch between what the situation demands and what the team is currently doing?", category: 'situation' },
  { day: 23, phase: 'learn', text: "How might your predecessor's misreading of the STARS situation have contributed to the current state of things?", category: 'situation' },
  { day: 24, phase: 'learn', text: "What feedback have you received — directly or indirectly — about how you're landing so far?", category: 'feedback' },
  { day: 25, phase: 'learn', text: "What are the informal power structures here — who do people really listen to?", category: 'stakeholders' },
  { day: 26, phase: 'learn', text: "What's your emerging hypothesis about this organisation's greatest strengths and vulnerabilities?", category: 'diagnosis' },
  { day: 27, phase: 'learn', text: "What part of your learning plan have you neglected? What will you do this week to address it?", category: 'planning' },
  // Days 28-30 — original
  { day: 28, phase: 'learn', text: "Who has surprised you the most so far — and what does that tell you?", category: 'relationships' },
  { day: 29, phase: 'learn', text: "As Phase 1 ends: what are the 5 things you know now that you didn't know on Day 1?", category: 'reflection' },
  { day: 30, phase: 'learn', text: "30 days. What's your honest assessment of the situation — and are you ready to shift from listening to acting?", category: 'milestone' },

  // Phase 2: Build & Connect (Days 31-40) — original prompts retained
  { day: 31, phase: 'build', text: "Phase 2 begins. What's the one early win that would most build your credibility right now?", category: 'wins' },
  { day: 32, phase: 'build', text: "Who is resistant to your agenda? What's driving their resistance — and what's your plan?", category: 'stakeholders' },
  { day: 33, phase: 'build', text: "Have you had the 5 critical conversations (situation, expectations, resources, style, development) yet? Which is still missing?", category: 'relationships' },
  { day: 34, phase: 'build', text: "What resources do you need that you haven't yet secured? What's stopping you from asking?", category: 'resources' },
  { day: 35, phase: 'build', text: "Is your team the right team? Who is struggling — and is it a fit issue or a development issue?", category: 'team' },
  { day: 36, phase: 'build', text: "What's your coalition — the group of people who will actively support your agenda?", category: 'stakeholders' },
  { day: 37, phase: 'build', text: "Where are you spending your time this week? Does it match your actual priorities?", category: 'self-awareness' },
  { day: 38, phase: 'build', text: "What early win have you delivered so far — and how was it received?", category: 'wins' },
  { day: 39, phase: 'build', text: "What's the one decision you've been avoiding? What would it take to make it today?", category: 'decisions' },
  { day: 40, phase: 'build', text: "What feedback have you received — directly or indirectly — about how you're landing?", category: 'feedback' },

  // Principle 4 (Negotiate Success) — days 41-45 (5 prompts over 5 days of this range, sharing with principle 5)
  { day: 41, phase: 'build', text: "Do you and your manager have a genuinely shared understanding of what success looks like at 90 days, or are you operating on assumptions?", category: 'negotiate' },
  { day: 42, phase: 'build', text: "Where are the decision rights most ambiguous, and what is the cost of leaving that ambiguity unresolved?", category: 'negotiate' },
  { day: 43, phase: 'build', text: "Are you giving your manager an accurate picture of progress and challenges, or are you filtering to manage impressions?", category: 'negotiate' },
  { day: 44, phase: 'build', text: "What has your manager not said to you directly that you suspect they are thinking?", category: 'negotiate' },
  { day: 45, phase: 'build', text: "Is your communication cadence with your boss genuinely useful for both of you, or has it become performative?", category: 'negotiate' },

  // Principle 5 (Secure Early Wins) — days 46-54 (mapped to days 37-45 window; using 46-54 in full rotation)
  { day: 46, phase: 'build', text: "What problem, if solved in the next 60 days, would most improve your team's confidence in your leadership?", category: 'early-wins' },
  { day: 47, phase: 'build', text: "Are you building wins that reflect your values and approach, or just demonstrating competence on inherited problems?", category: 'early-wins' },
  { day: 48, phase: 'build', text: "Where are you at risk of spreading effort too thin and producing partial progress on multiple fronts?", category: 'early-wins' },
  { day: 49, phase: 'build', text: "Who on your team most needs a visible win right now, and how can you create the conditions for them to have one?", category: 'early-wins' },
  { day: 50, phase: 'build', text: "What story are your early actions telling the organisation about what kind of leader you are?", category: 'early-wins' },

  // Principle 6 (Achieve Alignment) — days 51-54 (overlapping; 5 prompts over days 51-55)
  { day: 51, phase: 'build', text: "Where is the organisation saying one thing strategically but doing another operationally — and what is the real cost of that gap?", category: 'alignment' },
  { day: 52, phase: 'build', text: "What structural decisions made before you arrived are now limiting what is possible? Are they changeable?", category: 'alignment' },
  { day: 53, phase: 'build', text: "Where is culture the actual constraint — not a soft issue, but a genuine blocker of performance?", category: 'alignment' },
  { day: 54, phase: 'build', text: "Which of the five alignment elements is in the worst shape, and is it getting the right level of attention?", category: 'alignment' },
  { day: 55, phase: 'build', text: "What would alignment look like in this organisation if you achieved it? Be specific about what would be different.", category: 'alignment' },

  // Principle 7 (Build Your Team) — days 56-63
  { day: 56, phase: 'build', text: "If you were rebuilding this team from scratch today, who would you rehire immediately, and who would you pause on?", category: 'team' },
  { day: 57, phase: 'build', text: "Who on your team is visibly enthusiastic but whose capability you haven't yet genuinely stress-tested?", category: 'team' },
  { day: 58, phase: 'build', text: "Where is team underperformance coming from — individual capability, team dynamics, structural ambiguity, or something you're not yet seeing?", category: 'team' },
  { day: 59, phase: 'build', text: "What is the single most important thing you could do in the next 30 days to improve this team's collective performance?", category: 'team' },
  { day: 60, phase: 'build', text: "60 days. Who on your team is most at risk of leaving, and is that a loss you can afford?", category: 'milestone' },

  // Phase 3: Deliver & Lead (Days 61-90)
  // Principle 8 (Create Coalitions) — days 61-72 (5 prompts spread across this range)
  { day: 61, phase: 'deliver', text: "Phase 3. Who outside your direct reporting line has the greatest ability to help or hinder your most important priorities?", category: 'coalitions' },
  { day: 62, phase: 'deliver', text: "Where are you making assumptions about peer support that you haven't actually tested?", category: 'coalitions' },
  { day: 63, phase: 'deliver', text: "Who in the organisation holds informal influence that doesn't show up in the formal structure, and how well do you know them?", category: 'coalitions' },
  { day: 64, phase: 'deliver', text: "What are you offering the people in your network — is the relationship mutually valuable, or are you primarily a taker?", category: 'coalitions' },
  { day: 65, phase: 'deliver', text: "If your most important change initiative were announced tomorrow, who would publicly support it, who would be silent, and who would push back?", category: 'coalitions' },
  { day: 66, phase: 'deliver', text: "Where have you been too cautious in Phase 3 so far? Where have you moved too fast?", category: 'self-awareness' },
  { day: 67, phase: 'deliver', text: "What cultural elements are you actively reinforcing — and which are you letting drift?", category: 'culture' },
  { day: 68, phase: 'deliver', text: "What feedback loops have you created to keep learning beyond the 90-day window?", category: 'feedback' },
  { day: 69, phase: 'deliver', text: "Who has been your most important supporter so far? Have you thanked them properly?", category: 'relationships' },
  { day: 70, phase: 'deliver', text: "Ten weeks in. What does your team need from you most right now?", category: 'team' },
  { day: 71, phase: 'deliver', text: "What's one thing that, if you don't address it this week, will come back to bite you?", category: 'decisions' },
  { day: 72, phase: 'deliver', text: "What's your biggest regret so far — and what will you do differently because of it?", category: 'reflection' },

  // Principle 9 (Keep Your Balance) — days 73-81
  { day: 73, phase: 'deliver', text: "What has this week cost you personally — in sleep, energy, attention to people who matter to you — and is that cost sustainable?", category: 'balance' },
  { day: 74, phase: 'deliver', text: "What is the quality of your decision-making at the end of a high-pressure week, compared to the start? What does that tell you?", category: 'balance' },
  { day: 75, phase: 'deliver', text: "Final stretch. Are you processing the emotional demands of this transition, or suppressing them? What's the difference looking like in your behaviour?", category: 'milestone' },
  { day: 76, phase: 'deliver', text: "Who are you being, as a person, under the pressure of this role? Is it who you want to be?", category: 'balance' },
  { day: 77, phase: 'deliver', text: "What would you need to change about how you are managing this transition to still be performing at your best at 90 days — not just surviving?", category: 'balance' },
  { day: 78, phase: 'deliver', text: "What were your original 90-day goals? Honest assessment of where you stand.", category: 'goals' },
  { day: 79, phase: 'deliver', text: "What cultural norms have you successfully shifted — and what still needs work?", category: 'culture' },
  { day: 80, phase: 'deliver', text: "What do you now know about this role that you wish you'd known on Day 1?", category: 'reflection' },
  { day: 81, phase: 'deliver', text: "What's the one thing you haven't said to your team that you need to say?", category: 'team' },

  // Principle 10 (Accelerate Everyone) — days 82-90
  { day: 82, phase: 'deliver', text: "Who on your team is in the middle of a significant transition right now that you haven't fully acknowledged or supported?", category: 'accelerate' },
  { day: 83, phase: 'deliver', text: "What have you modelled for your team about how leaders learn and adapt in new situations?", category: 'accelerate' },
  { day: 84, phase: 'deliver', text: "If you left this role tomorrow, what transition capability and learning practices would remain in the team you've built?", category: 'accelerate' },
  { day: 85, phase: 'deliver', text: "Where are you still hoarding knowledge or approach rather than distributing it? What's behind that?", category: 'accelerate' },
  { day: 86, phase: 'deliver', text: "What's your plan for the post-90-day period? Day 91 is not the finish line.", category: 'planning' },
  { day: 87, phase: 'deliver', text: "What relationships have been most important to your success? What have you done to nurture them?", category: 'relationships' },
  { day: 88, phase: 'deliver', text: "Two days to go. What will you make sure you do before Day 90?", category: 'planning' },
  { day: 89, phase: 'deliver', text: "What's the one thing that would make you proud to say you did in your first 90 days?", category: 'reflection' },
  { day: 90, phase: 'deliver', text: "Day 90. What one thing, if you embedded it into this team's rhythm, would most improve its long-term learning capacity?", category: 'milestone' },
];

export const weeklyPrompts: string[] = [
  "What were your three biggest wins this week?",
  "What's one thing you learned this week that changed your thinking?",
  "Who did you build a stronger relationship with — and who did you neglect?",
  "Where did you spend your time? Does that reflect your actual priorities?",
  "What's sitting on your desk (physically or mentally) that you're avoiding?",
  "What would your team say was the best thing you did this week?",
  "What early win could you claim in the next two weeks?",
  "Where are you making assumptions that haven't been tested?",
  "What's one thing you'd do differently if you replayed this week?",
  "Who do you need to have a difficult conversation with — and when will you do it?",
  "What's your energy like — and what's draining or fuelling it?",
  "What cultural signals are you sending this week — intentional or not?",
  "What would your predecessor have done differently this week?",
  "What did you hear this week that you need to think more carefully about?",
  "Is your pace right? Too fast, too slow, or about right?",
  "What's the political landscape like — any shifts in support or resistance?",
  "What have you promised that you haven't delivered? What's the plan?",
  "Who surprised you this week — positively or negatively?",
  "What's the one conversation you most need to have next week?",
  "Are you still learning at the same rate as week 1 — or are you coasting?",
];

export function getPromptForDay(dayNumber: number): Prompt {
  const clampedDay = Math.min(Math.max(1, dayNumber), 90);
  const prompt = dailyPrompts.find(p => p.day === clampedDay);
  if (!prompt) {
    // Fallback for extended journeys
    const phasePrompts = dailyPrompts.filter(p => p.phase === 'deliver');
    return phasePrompts[dayNumber % phasePrompts.length] ?? dailyPrompts[dailyPrompts.length - 1];
  }
  return prompt;
}

export function getWeeklyPrompts(weekNumber: number): string[] {
  // Return 5 prompts, rotated by week
  const startIdx = ((weekNumber - 1) * 5) % weeklyPrompts.length;
  const prompts: string[] = [];
  for (let i = 0; i < 5; i++) {
    prompts.push(weeklyPrompts[(startIdx + i) % weeklyPrompts.length]);
  }
  return prompts;
}
