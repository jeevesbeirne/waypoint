import { colors } from './theme';

export interface Article {
  id: string;
  category: 'prepare' | 'learning' | 'situation' | 'negotiate' | 'early-wins' | 'alignment' | 'team' | 'coalitions' | 'balance' | 'accelerate';
  phase: 'learn' | 'build' | 'deliver' | 'all';
  title: string;
  readTimeMinutes: number;
  summaryBullets: string[];
  fullText: string;
  sources: string[];
}

export const CATEGORY_COLORS: Record<Article['category'], string> = {
  prepare: colors.neutral,
  learning: colors.phase.learn,
  situation: colors.phase.learn,
  negotiate: colors.accent,
  'early-wins': colors.phase.build,
  alignment: colors.phase.build,
  team: colors.phase.build,
  coalitions: colors.phase.deliver,
  balance: colors.neutral,
  accelerate: colors.phase.deliver,
};

export const CATEGORY_LABELS: Record<Article['category'], string> = {
  prepare: 'Prepare',
  learning: 'Learning',
  situation: 'Situation',
  negotiate: 'Negotiate',
  'early-wins': 'Early Wins',
  alignment: 'Alignment',
  team: 'Team',
  coalitions: 'Coalitions',
  balance: 'Balance',
  accelerate: 'Accelerate',
};

export const PHASE_ARTICLES: Record<'learn' | 'build' | 'deliver', string[]> = {
  learn: ['prepare-yourself', 'accelerate-your-learning', 'match-strategy-to-situation', 'negotiate-success'],
  build: ['secure-early-wins', 'achieve-alignment', 'build-your-team'],
  deliver: ['create-coalitions', 'keep-your-balance', 'accelerate-everyone'],
};

export const ARTICLES: Article[] = [
  {
    id: 'prepare-yourself',
    category: 'prepare',
    phase: 'learn',
    title: 'Prepare Yourself',
    readTimeMinutes: 3,
    summaryBullets: [
      'The skills that earned your promotion are not the same ones that will make you successful in the new role — recognise the "success trap"',
      'Conduct a personal SWOT before day one: map genuine strengths, blind spots, and where prior instincts may mislead you',
      'Identify the archetype of leader this role requires (strategic thinker, operator, people developer, or change catalyst) and where your gaps are',
      'Have the "identity severance" conversation with yourself — explicitly acknowledge what you are leaving behind from your previous role',
      'Build a pre-boarding learning agenda: gather public intelligence and form hypotheses to test in your first weeks',
    ],
    fullText: `### The Mental Shift No One Warns You About

The most dangerous assumption a newly appointed leader can make is that the skills and behaviours that earned them the promotion are the same ones that will make them successful in the new role. Michael Watkins calls this the "success trap" — and it is the single most common reason high-potential leaders stumble in transition.

Research from McKinsey suggests that nearly 50% of senior leaders underperform or leave their roles within the first 18 months, and Watkins' own data across thousands of executive transitions points to a consistent root cause: leaders who fail to mentally and practically prepare for the fundamental differences between their old role and their new one.

**Preparation is not about logistics.** It is not reading your new company's annual report on the plane, or memorising the org chart before day one. It is about understanding that your identity as a leader must evolve. What got you here — technical expertise, a strong individual contributor track record, being the smartest person in the room — will not necessarily serve you in a role where your leverage is now entirely through others.

The transition from functional expert to enterprise leader is particularly treacherous. In your previous role, you could rely on deep domain knowledge. In a new senior role, especially across industries or functions, you are frequently the person who knows least about the operational details. The leaders who manage this well are those who have explicitly acknowledged the shift and recalibrated their self-concept accordingly.

**What to do:**

1. **Conduct a personal SWOT before day one.** Map your genuine strengths, blind spots, and the areas where your previous role's instincts may mislead you. Be brutally honest. If you have always been a "fix it" operator and you're joining a start-up phase organisation, your instinct to stabilise and systematise may actively harm the culture you need to build.

2. **Identify the archetype of leader this role requires.** Watkins outlines four archetypes that appear across transitions: the strategic thinker, the operator, the people developer, and the change catalyst. Most leaders are strong in one or two. Know which this role demands most, and where your gaps are.

3. **Have the severance conversation with your former identity.** This is the most underrated act of preparation. Write down what you are leaving behind — the titles, the status, the expertise — and consciously let it go. Leaders who cling to their former identity spend too long proving what they already know rather than learning what they need to.

4. **Build a pre-boarding learning agenda.** Before you start, gather what you can from public sources: earnings calls, press coverage, Glassdoor reviews, LinkedIn tenure patterns of the leadership team. Form hypotheses. Arrive with intelligent questions, not blank-slate naivety.

**Common mistakes to avoid:**

- **Hitting the ground running before you've listened.** Action bias is a liability in the first 30 days. The instinct to demonstrate decisiveness by moving fast almost always damages credibility with people who were there before you.
- **Importing your old playbook wholesale.** Every organisational context is different. What worked in your last company — the operating cadence, the communication style, the decision-making approach — may be entirely wrong here.
- **Underestimating the political landscape.** Senior roles come with inherited relationships, historical grievances, and existing coalitions. Ignoring these dynamics and operating as though you're starting with a clean slate is a classic error.

> **Key Insight:** "The first task in making a successful transition is to accelerate your own personal development — not to prove what you already know." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'McKinsey & Company (2018). *Successfully transitioning to new leadership roles*.',
    ],
  },
  {
    id: 'accelerate-your-learning',
    category: 'learning',
    phase: 'learn',
    title: 'Accelerate Your Learning',
    readTimeMinutes: 3,
    summaryBullets: [
      'The highest-leverage activity in the first 30 days is not action, but structured, disciplined learning',
      'Leaders who invest in structured learning reach their break-even point faster, not slower',
      'Explore five dimensions: technical, cultural, political, stakeholder, and historical',
      'Conduct structured listening sessions with consistent questions across all stakeholders — not general listening tours',
      'Seek out institutional historians and read the artefacts — documents reveal what an organisation believes about itself',
    ],
    fullText: `### Learning as a Strategic Discipline

In the early weeks of a new leadership role, the instinct to *do* is almost overwhelming. There is pressure — from bosses, boards, and your own internal drive — to demonstrate value quickly. The counterintuitive insight from Watkins' research is that the highest-leverage activity a new leader can engage in during the first 30 days is not action, but structured, disciplined learning.

This is not passive absorption. It is strategic intelligence gathering — understanding the technical realities of the business, the cultural forces that shape behaviour, the political landscape that determines what actually gets done, and the historical context that explains why things are the way they are. Leaders who shortcut this phase take action before they understand the terrain, and often spend months unwinding decisions they made too quickly.

The research is striking: Watkins identifies that new leaders typically face a "break-even point" — the moment at which they have contributed as much value as they have consumed in ramp-up costs — at around 6.2 months. Leaders who invest in structured learning in the first 30 days consistently reach that break-even point faster, not slower. The learning phase is not a delay before impact; it is the accelerant of impact.

**Five dimensions of learning:**

Watkins identifies five distinct domains that require exploration in any new role:

1. **Technical** — the business model, financial levers, operational realities, product or service architecture
2. **Cultural** — the unwritten rules, what is celebrated vs. what is tolerated, how decisions actually get made
3. **Political** — who holds informal power, where the coalitions are, who the key influencers are beyond the org chart
4. **Stakeholder** — what each key stakeholder needs from you, fears about you, and hopes for the role
5. **Historical** — what has been tried before, what failed, what the organisation has collective memory around

**What to do:**

1. **Build a structured learning plan before day one.** Identify the 8–10 most important questions you need to answer about the business and its context. Assign owners, sources, and a timeline for getting answers.

2. **Conduct structured listening sessions in the first 30 days.** Not small talk, not town halls — structured 30–45 minute 1:1s with a consistent set of questions that you ask everyone. This produces comparable data across stakeholders and signals that you are listening before acting.

3. **Seek out the historians.** In every organisation, there are people — not always senior — who have been there longest and understand the institutional memory. Find them. The person who has been in the organisation 12 years and is two levels below you may be the most valuable intelligence source you have.

4. **Read the artefacts.** Strategy decks, board papers, post-mortems, past engagement surveys, customer research. The documents an organisation produces reveal what it believes about itself. The gaps in those documents reveal what it avoids.

5. **Test your hypotheses explicitly.** Go in with structured hypotheses and test them through conversations. This transforms passive listening into active investigation and produces sharper conclusions faster.

**Common mistakes to avoid:**

- **Conducting a 'listening tour' with no structure.** Vague conversations produce vague insights. If every conversation is different, you cannot compare what you hear.
- **Learning only from the top.** The most accurate picture of an organisation's culture and operational reality often comes from middle management and individual contributors, not from your direct reports.
- **Stopping the learning when the doing starts.** Learning should not be confined to the first 30 days. The best leaders treat it as a continuous discipline.

> **Key Insight:** "The biggest mistake new leaders make is to begin trying to change things before they understand the system they're entering." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'Bradt, G. (2015). *The New Leader\'s 100-Day Action Plan*. Wiley.',
    ],
  },
  {
    id: 'match-strategy-to-situation',
    category: 'situation',
    phase: 'learn',
    title: 'Match Strategy to Situation',
    readTimeMinutes: 3,
    summaryBullets: [
      'The STARS model identifies five situations: Start-up, Turnaround, Accelerated Growth, Realignment, and Sustaining Success',
      'The right leadership approach for a turnaround is catastrophically wrong in a sustaining success situation',
      'Most real situations are mixed — apply the framework across multiple dimensions independently',
      'Diagnose your STARS situation before forming any strategic hypothesis — and test it across multiple stakeholders',
      'Communicate your situational reading to create shared understanding; if people disagree on the situation, decisions will be chaotic',
    ],
    fullText: `### Why Context Is Everything — and Most Leaders Ignore It

One of the most powerful and underused frameworks in executive transitions is Watkins' STARS model. It stands for **Start-up, Turnaround, Accelerated Growth, Realignment, and Sustaining Success** — five fundamentally different organisational situations that each demand a completely different leadership approach.

The failure mode that this principle is designed to prevent is depressingly common: a leader who was extraordinarily effective in one type of situation joins an organisation in a very different situation and attempts to apply the same playbook. The turnaround operator who joins a realignment situation and rips out structures and people. The sustaining-success leader who joins a start-up and tries to install governance frameworks before anyone knows if the business model works. The costs — in wasted time, damaged culture, and lost momentum — are enormous.

McKinsey research on executive transitions consistently finds that misalignment between leadership style and organisational context is among the top three contributors to transition failure. Watkins provides the diagnostic language that most organisations lack.

**The five STARS situations:**

- **Start-up:** Building something from scratch. The organisation (or unit) does not yet exist in its current form. Energy, creativity, and tolerance for ambiguity are required. Heavy process and governance are counter-productive.
- **Turnaround:** Rescuing a failing or significantly underperforming unit. Rapid diagnosis, hard decisions, and decisive action are necessary. Speed matters more than consensus-building.
- **Accelerated Growth:** Scaling something that is working. The challenge is building the infrastructure — people, systems, processes — to support growth without killing what made the business successful.
- **Realignment:** Reconfiguring an organisation that is drifting or under-performing but not yet in crisis. The hardest situation because people often don't accept that change is necessary. The leader must create a sense of urgency without manufactured crisis.
- **Sustaining Success:** Maintaining and evolving an already high-performing organisation. The challenge is motivating a team that is succeeding and staying ahead of the competitive curve.

**What to do:**

1. **Diagnose your STARS situation before forming any strategic hypothesis.** Talk to your manager, board, and key stakeholders — and test their views against each other. Ask directly: "What is the organisation's primary challenge right now?" You may inherit a situation your predecessor has misdiagnosed.

2. **Resist the temptation to treat all situations the same.** Your instinct will be to lead the way you've always led. Override it. Explicitly calibrate your default behaviours against what this situation actually needs.

3. **Understand that most real situations are mixed.** A business unit may be a sustaining success financially while its culture is in a realignment situation. Map the STARS status across multiple dimensions: financial performance, team health, culture, strategy, operations.

4. **Communicate clearly which situation the organisation is in.** One of the leader's primary responsibilities is to give people a shared understanding of the situation so that effort is coherent. If some people think it's a turnaround and others think it's sustaining success, decision-making will be chaotic.

**Common mistakes to avoid:**

- **Applying a turnaround approach to a realignment situation.** This is perhaps the most damaging mismatch: a leader who declares crisis, moves aggressively, and alienates the high performers who don't see a crisis.
- **Being seduced by what worked last time.** If you ran three successful turnarounds, the world will keep giving you turnaround problems to solve — even when the situation is something else.
- **Failing to reassess as the situation evolves.** The STARS situation is not static. An organisation in realignment that acts decisively may move into accelerated growth within 18 months. The leader's approach must evolve.

> **Key Insight:** "The most important thing is to diagnose the situation correctly before deciding what to do. The same leadership approach that rescues one organisation will destroy another." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'McKinsey & Company (2018). *Ascending to the C-suite*.',
    ],
  },
  {
    id: 'negotiate-success',
    category: 'negotiate',
    phase: 'learn',
    title: 'Negotiate Success',
    readTimeMinutes: 3,
    summaryBullets: [
      'The relationship with your manager is your most critical infrastructure — new leaders systematically underinvest in it',
      'Watkins identifies 5 conversations — start with Situational Diagnosis FIRST, because your expectations conversation depends on understanding what situation you\'re in',
      'Conversation sequence: (1) Situational diagnosis → (2) Expectations → (3) Resources → (4) Style → (5) Personal development',
      'Underpromise in early conversations — you do not yet know what is achievable',
      'Establish a regular one-to-one cadence immediately — weekly for the first 30 days, then fortnightly',
    ],
    fullText: `### Your Relationship with Your Boss Is Your Most Critical Infrastructure

If there is one relationship that determines more of a new leader's success or failure than any other, it is the relationship with the person they report to. And yet, Watkins' research consistently reveals that new leaders systematically underinvest in this relationship, particularly in the first 90 days when the patterns are being set.

"Negotiate success" does not mean gaming the system or managing perceptions. It means engaging in explicit, structured conversations with your manager about expectations, success criteria, working style, and the resources you need — before either of you has defaulted into assumptions that may not serve either party.

The consequences of failing to do this are documented across Watkins' longitudinal research. New leaders who do not explicitly negotiate their mandate often spend months executing against objectives that have quietly shifted, without anyone having told them. They discover that the "authority" they believed they had is more constrained than they realised. They receive critical feedback at the six-month mark that could have been shared in week two if the conversation had been structured to allow it.

**The 5 Conversations — in the correct sequence:**

Watkins is explicit: you must do situational diagnosis FIRST. Your expectations conversation depends on first understanding what situation you're in. If you don't know whether you're in a turnaround or a sustaining success, your negotiation will be built on sand.

1. **Situational diagnosis (conversation 1 — do this first).** Do you and your manager agree on the STARS situation? What are the real challenges and opportunities? What kind of situation is this? If you and your boss don't agree on whether this is a turnaround or a realignment, your entire 90-day plan will be wrong by definition. This conversation must happen before you negotiate expectations.

2. **Expectations (conversation 2).** What does your boss actually need to see by 30, 60, and 90 days? Not the aspirational goal — the minimum viable success threshold. Write it down and confirm it. People's internal success criteria are often not what they articulate in job descriptions or onboarding conversations.

3. **Resources (conversation 3).** What do you need to succeed and how will you get it? If your plan requires headcount, budget, or executive support, negotiate this explicitly upfront. Leaders who assume resource will follow mandate often find it doesn't.

4. **Style (conversation 4).** How does your boss prefer to work and communicate? Written briefings, verbal updates, dashboards? How often? What are their known triggers? A mismatch in communication style is a persistent, low-grade source of tension that is entirely preventable.

5. **Personal development (conversation 5).** What should you focus on improving? This is the most forward-looking of the five conversations and should happen after the situational and operational foundations are established.

**What to do:**

1. **Request a structured expectations conversation in week one.** Don't wait for your manager to initiate. Bring a one-page framing document that proposes the topics: success criteria, decision rights, resources, communication cadence.

2. **Underpromise in early conversations.** The temptation to impress a new boss by committing to ambitious targets is real. Resist it. You do not yet know what is achievable. Commit to fewer things and deliver them.

3. **Establish a regular one-to-one cadence immediately.** Weekly in the first 30 days, moving to fortnightly. Do not let the relationship become episodic in the early months.

4. **Surface disagreements early and professionally.** If you see the situation differently from your manager, say so respectfully and with evidence. Silence is agreement in most organisations. If you disagree but comply without flagging it, you own the outcome.

**Common mistakes to avoid:**

- **Assuming clarity where there is ambiguity.** Most managers think they've been clear when they haven't. Most new leaders think they've understood when they haven't. Write things down and confirm.
- **Managing up by managing impressions rather than reality.** Bosses who are not getting honest information become unreliable sponsors. Be the leader who gives their boss accurate pictures of what is happening.
- **Neglecting the relationship when things are going well.** The one-to-one cadence is not just for problems. Proactive communication prevents surprises.

> **Key Insight:** "Your relationship with your new boss is the most important relationship you need to build. Neglecting it, or allowing it to default into assumptions, is one of the most costly mistakes a new leader can make." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'Ciampa, D. & Watkins, M. (1999). *Right from the Start*. HBR Press.',
    ],
  },
  {
    id: 'secure-early-wins',
    category: 'early-wins',
    phase: 'build',
    title: 'Secure Early Wins',
    readTimeMinutes: 3,
    summaryBullets: [
      'Early wins build the reservoir of credibility that makes harder things possible later — they are not quick fixes',
      'The best early wins address something the organisation genuinely cares about and produce visible outcomes within 60 days',
      'Prioritise team wins over personal wins — a win that belongs to the team builds more durable credibility',
      'Avoid tackling the hardest problem first; start with a smaller, completable problem',
      'Frame every early win as a proof point of your strategic narrative, not an isolated achievement',
    ],
    fullText: `### Building the Credibility That Makes Everything Else Possible

In the first 90 days, new leaders are under scrutiny in ways they often underestimate. Teams are forming impressions, colleagues are pattern-matching against prior leaders, and the organisation is watching to see whether this person understands what matters here. The principle of securing early wins is about more than tactical success — it is about building the reservoir of credibility that makes everything harder to do later actually possible.

Watkins is precise about what early wins are not: they are not quick fixes, they are not high-profile gestures that sacrifice long-term value for short-term optics, and they are not demonstrations of the leader's personal brilliance at the expense of team ownership. The best early wins are those that address something the organisation genuinely cares about, involve the team in delivering them, and produce a visible outcome that credibly signals what this leader stands for.

The research is clear that credibility is the scarce resource of a new leader. Without it, strategy cannot be communicated effectively, change cannot be driven, and team performance cannot be improved. With it, almost everything accelerates. The first 90 days are the highest-leverage window for building it — because people are paying more attention to you than they ever will again.

**What counts as an early win:**

Not all wins are equal. The most valuable early wins have three properties:

1. **They matter to the people who matter.** They address something that your key stakeholders — boss, team, or key customers — genuinely care about. A quick win that only you think is important does not build credibility with others.
2. **They are achievable within the transition window.** Wins that take 18 months to manifest are not early wins. They should produce visible progress within 60 days and clear outcomes within 90.
3. **They signal something about your leadership values.** The best early wins teach people something about how you operate: that you listen before acting, that you keep commitments, that you develop others rather than doing it yourself.

**What to do:**

1. **Identify two to three early win targets by week 3.** These should emerge from your listening tour and your STARS diagnosis. Ask yourself: what are the highest-value problems that are actually solvable in 60 days?

2. **Prioritise team wins over personal wins.** A win that belongs to the team builds more durable credibility than one that belongs to the leader. Position yourself as the enabler, not the hero.

3. **Avoid the temptation to tackle the hardest problem first.** The biggest, most complex problems are rarely solvable in 90 days. Starting with them and making partial progress is often worse than starting with a smaller problem and completing it.

4. **Create visible momentum markers.** Even in complex, long-cycle environments, identify milestones that can be celebrated within the 90 days. Momentum is as much about narrative as outcome.

5. **Connect early wins to strategic intent.** Frame early wins as proof points of the larger strategy you are building, not isolated tactical achievements. This gives team members a sense of direction, not just activity.

**Common mistakes to avoid:**

- **Attempting too many things at once.** The early-days energy is real, but spreading effort across too many initiatives produces mediocre progress on all of them.
- **Going for the visible at the expense of the important.** Reorganisations, rebrands, and leadership retreats create visible activity. Deep customer problems, operational inefficiencies, and team-capability gaps create lasting value.
- **Claiming wins without team acknowledgement.** Leaders who publicly take credit for team contributions in the first 90 days rarely recover the resulting trust deficit.

> **Key Insight:** "You need early wins to build credibility and create momentum. Done well, they create a virtuous cycle: credibility enables bolder action, which enables bigger wins." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'Gabarro, J.J. (1987). *The Dynamics of Taking Charge*. HBR Press.',
    ],
  },
  {
    id: 'achieve-alignment',
    category: 'alignment',
    phase: 'build',
    title: 'Achieve Alignment',
    readTimeMinutes: 3,
    summaryBullets: [
      'True alignment requires that strategy, structure, systems, skills, and culture are mutually reinforcing',
      'A strategy change not reflected in structural changes will be resisted by the existing structure',
      'Use your outsider status while you still have it — ask "why do we organise this way?" before it seems naive',
      'Start with culture and structure before systems — systems built on misaligned foundations will be gamed or abandoned',
      'Identify misalignments you can fix quickly vs. those requiring 12–18 months of sustained effort',
    ],
    fullText: `### The Hidden Architecture of Organisational Performance

Most new leaders, when they think about alignment, think about strategy — getting people aligned behind a common direction. Watkins' principle is more ambitious and more precise than this. True alignment requires that an organisation's strategy, structure, systems, skills, and culture are mutually reinforcing. When any one of these elements is pulling against the others, performance suffers in ways that are difficult to diagnose because the symptoms rarely point directly at the source.

This principle typically becomes most relevant in weeks 4–8 of a transition, when the new leader has enough understanding to begin identifying where the organisation is not aligned, but has not yet made commitments that are difficult to reverse. The window for structural diagnosis is real but time-limited.

Watkins draws on a fundamental insight from organisational design theory: an organisation is a system. Every element of the system — the strategy it pursues, the structure that organises effort, the processes and systems that enable work, the people and capabilities deployed, and the culture that shapes norms and behaviour — is connected to every other element. A strategy change that is not reflected in structural changes will be resisted by the existing structure. A structure change without a corresponding capability investment will fail because people don't have the skills to operate in the new model.

**The five alignment elements:**

1. **Strategy** — The direction and choices: what the organisation is trying to achieve and what it has decided not to do.
2. **Structure** — How authority, accountability, and resource are organised. Formal reporting lines, but also decision forums and governance.
3. **Systems** — The processes, technology, and management infrastructure that enable work to get done.
4. **Skills** — The capabilities of the people in the organisation, individually and collectively.
5. **Culture** — The values, norms, and shared beliefs that shape how people behave, especially when no one is watching.

**What to do:**

1. **Conduct an alignment diagnostic across all five elements.** For each element, ask: is this consistent with our stated strategy? Where are the contradictions? A useful shortcut is to look for places where the stated strategy and the actual resource allocation diverge — that gap is almost always an alignment fault line.

2. **Start with culture and structure before systems.** Leaders often find it easier to change systems and processes than culture and structure. But systems built on misaligned structure and culture will be gamed, resisted, or abandoned. Sequence your interventions in the right order.

3. **Use your outsider status while you still have it.** In the first 60 days, you can ask questions that would seem naive later. "Why do we organise it this way?" "Why do we have two teams doing similar things?" Use this window aggressively.

4. **Identify the misalignments you can fix quickly vs. those that will require sustained effort.** Not all misalignments are equal. Quick structural clarifications (fixing unclear accountability, eliminating a redundant approval step) signal decisiveness. The deeper cultural and capability misalignments will take 12–18 months and should be treated as a strategic programme, not a 90-day task.

**Common mistakes to avoid:**

- **Reorganising as a default response.** Structural reorganisation is one of the most disruptive and costly interventions available to a leader. It should follow from a clear diagnosis of structural misalignment, not be used as a signal of new leadership intent.
- **Changing strategy without changing the structure that reinforces the old strategy.** This is the most common alignment failure and produces the most frustrating results: a new strategy that is nominally adopted but behaviourally resisted.
- **Ignoring culture as "the soft stuff".** Watkins is unambiguous: culture is the hardest element to change and the most consequential. New leaders who treat it as secondary almost always underperform.

> **Key Insight:** "Organisations are systems. If you change the strategy but not the structure and culture, the organisation will slowly revert to its old behaviour. Alignment is not a one-time act — it is a continuous discipline." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'Kotter, J. (1995). *Leading Change: Why Transformation Efforts Fail*. Harvard Business Review.',
    ],
  },
  {
    id: 'build-your-team',
    category: 'team',
    phase: 'build',
    title: 'Build Your Team',
    readTimeMinutes: 3,
    summaryBullets: [
      'New leaders systematically wait too long to make team changes — act within 60 days once assessment is clear',
      'Assess each direct report on two dimensions: competence (can they do the job?) and alignment (are they committed to the direction?)',
      'High competence, low alignment is the most dangerous profile — capable of doing significant damage',
      'Give meaningful assignments before forming final judgements — people behave differently under a new leader',
      'Invest in team cohesion as a collective, not just individual excellence — high performance is a team dynamic',
    ],
    fullText: `### The Team You Inherit Is the Decision You Cannot Avoid

The hardest single decision most senior leaders face in transition is the inherited team. You did not hire these people. Some of them may have been candidates for your role. Some are outstanding. Some are not. And you must make consequential decisions about their futures under enormous time pressure, with incomplete information, and with the knowledge that moving too quickly damages morale, culture, and organisational memory, while moving too slowly allows misaligned people to shape your agenda before you've established your own.

Watkins' guidance is clear: new leaders systematically wait too long to make team changes. The typical reason is empathy — they don't want to harm people's careers without giving them a chance. This is admirable, but it conflates two different decisions: the decision about whether someone is right for the role, and the decision about how to manage them out with care and dignity. The first decision should be made rigorously within 60 days. The second can and should be handled with humanity.

The cost of delayed team decisions is well-documented. McKinsey research on high-performing leadership teams consistently shows that team composition decisions in the first 90 days have outsized impact on outcomes at 12 and 18 months. Waiting 6–9 months to address a miscast leader allows that person to shape culture, slow decision-making, and (in the worst cases) become entrenched in a way that makes the eventual departure more painful and costly.

**The assessment framework:**

Watkins recommends assessing inherited team members on two dimensions: **competence** (can they do the job at the required level?) and **alignment** (are they committed to the direction you are taking?). Four quadrants emerge:

- High competence, high alignment: the foundation of your team — develop and retain
- High competence, low alignment: the most dangerous profile — capable of doing significant damage; requires either a genuine shift in alignment or a difficult decision
- Low competence, high alignment: coachable — invest in development or identify a better-fit role
- Low competence, low alignment: these decisions cannot be deferred

**What to do:**

1. **Complete individual assessments of each direct report within 60 days.** This does not mean you act on all of them by day 60, but you should have a clear view of each person's competence and alignment, and a plan for each.

2. **Distinguish between performance and fit.** Some people are performing adequately in the current context but are not right for the role this organisation needs going forward. That is a different conversation — and a different decision — from managing underperformance.

3. **Create conditions for people to show you what they can do.** Give meaningful assignments before forming final judgements. People behave differently under a new leader, and you may see capability that previous leaders suppressed.

4. **Use Watkins' recommended questions for first conversations with direct reports.** These are designed to surface honest insight without triggering defensiveness:
   - What do you think are the biggest challenges we face as a team?
   - What are the most promising opportunities we're not fully exploiting?
   - What do you think I need to learn quickly to be effective here?
   - What would you do differently if you were in my position?
   - What are you most worried about?

5. **Move decisively when the assessment is clear.** When you have confidence that someone is miscast — whether through capability, alignment, or fit — acting within the first 90 days is significantly less disruptive than acting at month 8.

**Common mistakes to avoid:**

- **Inheriting the team and the team plan.** Your predecessor's assessment of talent may have been distorted by their own leadership style, politics, or biases. Assess fresh.
- **Being seduced by loyalty.** The people who are most visibly supportive of new leadership are not always the strongest performers. Distinguish between enthusiasm for the new leader and genuine capability.
- **Neglecting to build the team as a collective.** Individual assessments are necessary but not sufficient. High-performing teams have a dynamic that transcends the sum of individual capabilities. Invest in team cohesion, not just individual excellence.

> **Key Insight:** "The people you inherit are a given. What you do with them — and how quickly — is one of the most consequential choices you will make as a new leader." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'McKinsey & Company (2021). *Building capabilities for performance*.',
      'Lencioni, P. (2002). *The Five Dysfunctions of a Team*. Jossey-Bass.',
    ],
  },
  {
    id: 'create-coalitions',
    category: 'coalitions',
    phase: 'deliver',
    title: 'Create Coalitions',
    readTimeMinutes: 3,
    summaryBullets: [
      'The most consequential things a senior leader accomplishes cannot be achieved through direct authority alone',
      'Map the influence landscape: whose support is required, who holds informal power, and where are the potential blocking coalitions',
      'Invest disproportionately in pivotal stakeholders — those whose support multiplies your agenda or whose opposition would be costly',
      'Find common ground first — the most effective coalition-building starts with shared interests, not advocating for your agenda',
      'Coalitions require ongoing investment; build them before you need them, not under crisis conditions',
    ],
    fullText: `### Influence Beyond Your Reporting Line

The most consequential things a senior leader needs to accomplish cannot be achieved through the authority they hold directly. Strategy requires organisational commitment from people who don't report to you. Culture change requires peer leaders who reinforce new norms in their own teams. Resource allocation requires relationships with finance, legal, and HR that go beyond transactional. Regulatory or stakeholder challenges require external influence. In all of these cases, the critical competency is coalition-building: the ability to create and maintain a network of people who support your agenda and will lend their credibility, effort, and influence to it.

Watkins draws a critical distinction between the organisation's formal power structure (the org chart) and its informal influence network (who actually shapes opinion and decisions). New leaders who focus exclusively on the formal structure typically find that their authority is more limited than they expected and that obstacles appear from directions they weren't watching.

The research on executive effectiveness is unambiguous: leaders who invest early in lateral relationships and informal influence networks consistently outperform those who rely solely on hierarchical authority. A Harvard Business Review analysis of 260 leaders in transition found that inadequate attention to lateral relationship-building was the second most common cause of transition failure, behind only failure to align with the boss.

**Mapping the influence landscape:**

Before building coalitions, you must understand the terrain. Watkins recommends mapping:

1. **Whose support is required for your key priorities?** Not just nominal agreement — active support, resource commitment, or advocacy.
2. **Who holds informal power beyond their formal title?** This includes respected veterans, connectors who know everyone, and people whose opinions carry outsized weight with the CEO or board.
3. **Where are the potential blocking coalitions?** Who might resist your agenda, and who do they influence? Understanding opposition is as important as building support.

**What to do:**

1. **Build your stakeholder map in the first 30 days.** For each key stakeholder outside your reporting line, assess: their current stance toward your agenda (supporter, neutral, opponent), their level of influence, and what they care about most.

2. **Invest disproportionately in pivotal stakeholders.** Not everyone needs the same investment. Identify the two or three people whose support will have a multiplier effect on your agenda — those with broad influence or whose opposition would be particularly costly.

3. **Find the common ground first.** The most effective coalition-building starts with identifying shared interests, not with advocating for your agenda. If a peer leader cares deeply about customer experience, and your change initiative will improve it, lead with that.

4. **Maintain relationships through value exchange.** Coalitions require ongoing investment. The most resilient influence networks are built on mutual benefit, not one-directional support. Be a giver before you need to be a recipient.

**Common mistakes to avoid:**

- **Assuming peer support because there was no visible opposition.** Silence is not support. Test for genuine commitment, not just absence of objection.
- **Neglecting lateral relationships until you need them.** Building an influence network under crisis conditions rarely works. Invest before you need to withdraw.
- **Creating transactional rather than relational coalitions.** A coalition held together only by mutual interests will fragment when interests diverge. The most robust alliances are built on genuine respect and relationship.

> **Key Insight:** "The most powerful lever available to a new leader is often not the authority they hold, but the coalition they build. Neglect it, and authority becomes a ceiling. Invest in it, and authority becomes a floor." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'HBR (2012). *The Necessary Art of Persuasion*.',
      'Ibarra, H. & Hunter, M. (2007). *How Leaders Create and Use Networks*. Harvard Business Review.',
    ],
  },
  {
    id: 'keep-your-balance',
    category: 'balance',
    phase: 'deliver',
    title: 'Keep Your Balance',
    readTimeMinutes: 3,
    summaryBullets: [
      'The transition period is a sustained stress test — your support networks, familiar rhythms, and known identity are all disrupted simultaneously',
      'Leaders under sustained stress make faster, lower-quality decisions and become less able to receive critical feedback',
      'Name your stress triggers explicitly — named triggers are manageable; unnamed ones operate unconsciously',
      'Protect non-negotiable recovery rituals and treat them with the same importance as your most critical business meetings',
      'Build a judgement-free advisory relationship — someone with whom you can think out loud without filtering',
    ],
    fullText: `### The Transition as a Personal Stress Test

Most leadership development frameworks focus on what new leaders should do. Watkins' principle of keeping your balance is different: it focuses on who the leader needs to be and how they sustain the personal resources — cognitive, emotional, and relational — to do the work well under conditions of high pressure and persistent ambiguity.

The transition period is, by design, a period of sustained high stress. The information demands are enormous. The interpersonal complexity is high. The stakes are significant and visible. The support networks that buffered stress in the previous role — trusted colleagues, established relationships, familiar rhythms — are all disrupted simultaneously. Research from organisational psychologists confirms that leadership transitions are consistently rated as among the most stressful professional experiences, often comparable in stress loading to bereavement or relocation.

The consequences of imbalance are documented: leaders under sustained stress make faster, lower-quality decisions; they become less curious and more defensive; they are less able to receive and process critical feedback; and they signal distress to their teams in ways that damage morale and psychological safety. A leader who loses their balance in the first 90 days may recover, but often not before lasting damage is done to relationships and credibility.

**The three pillars of transition resilience:**

1. **Cognitive resilience:** The ability to operate with ambiguity, resist premature closure, and maintain structured thinking when information is incomplete and pressure is high. Practices: structured journaling, regular sense-making conversations with trusted peers, maintaining a daily decision log.

2. **Emotional resilience:** The ability to process and regulate the emotional demands of the transition — disappointment, anxiety, conflict, and the identity disruption that comes with leaving a known context. Practices: maintaining physical health routines, preserving time with people who provide unconditional support, and processing with a coach or therapist if the emotional load is significant.

3. **Relational resilience:** The ability to maintain high-quality relationships — both professional and personal — under conditions of high time pressure. New leaders often sacrifice family and social relationships for professional demands in the first 90 days, with significant downstream costs.

**What to do:**

1. **Name your stress triggers explicitly.** Understand what specific situations in this transition will be most destabilising for you — ambiguity, conflict, isolation, imposter syndrome, public scrutiny. Named triggers are manageable; unnamed triggers operate unconsciously.

2. **Protect non-negotiable recovery rituals.** Whether it is exercise, sleep quality, family dinners, or a weekly long walk — identify the two or three activities that most reliably restore your cognitive and emotional energy, and protect them explicitly. They are as important as any business meeting.

3. **Build a judgement-free advisory relationship.** This is different from professional mentoring. It is a person — or small number of people — with whom you can think out loud, express uncertainty, and process failure without any of it being managed or filtered. Most leaders have too few of these.

4. **Schedule reflection time.** This is not meditation (unless that works for you); it is deliberately protected time to step back from the daily reactive cycle, review your learning, and check that your actions are still aligned with your intentions. Even 30 minutes once a week is transformative.

**Common mistakes to avoid:**

- **Treating self-care as indulgent.** Leaders who sacrifice sleep, exercise, and recovery time in the name of demonstrating commitment typically make worse decisions, not better ones. Sustainable high performance requires active recovery.
- **Isolating from support networks under pressure.** The instinct under high stress is often to withdraw. The opposite is required: the people who can help you process difficulty are most needed when you are least inclined to reach out.
- **Conflating busyness with effectiveness.** The first 90 days typically produce an enormous volume of meetings, requests, and reactive demands. The leaders who manage this best protect deliberate time for the work that matters, not just the work that is loudest.

> **Key Insight:** "Taking care of yourself is not a luxury during a transition — it is a strategic necessity. Leaders who lose their balance in the first 90 days rarely recover the ground they lose." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'Loehr, J. & Schwartz, T. (2003). *The Power of Full Engagement*. Free Press.',
      'HBR (2019). *How to Sustain Your Energy*. Harvard Business Review.',
    ],
  },
  {
    id: 'accelerate-everyone',
    category: 'accelerate',
    phase: 'deliver',
    title: 'Accelerate Everyone',
    readTimeMinutes: 3,
    summaryBullets: [
      'At any given time, 25–35% of managers in a large organisation are in some form of role transition — each carrying the same risks as your own',
      'Share your learning methodology with your team: listening approach, stakeholder mapping, alignment diagnostics',
      'Build transition support into your management cadence — make "what are you navigating?" a standing question in 1:1s',
      'Model intellectual humility visibly: change your mind based on evidence, acknowledge misjudgements, express uncertainty',
      'Document your onboarding experience before day 90 — your transition is data that improves the organisation\'s future capability',
    ],
    fullText: `### From Individual Transition to Organisational Capability

The final principle in Watkins' framework shifts the lens from the individual leader to the organisation. A senior leader who successfully navigates their own transition has built something valuable — but if the transition skills and learning practices are locked in one person, the organisation has not become more capable of navigating change. The principle of accelerating everyone is about systematically sharing what you have learned and building the transition capability of your team and organisation.

This principle has two distinct dimensions, both of which matter:

**1. Accelerating your own team's transitions.** The McKinsey research on leadership transitions reveals a sobering figure: at any given time, between 25% and 35% of managers in a large organisation are in some form of role transition — new role, new boss, newly expanded scope. Each of those transitions carries the same risks as your own: action taken without sufficient learning, relationships not built before they're needed, early wins pursued at the cost of strategic clarity. A leader who invests in their team's transition capability multiplies organisational performance.

**2. Creating a learning organisation from your own transition experience.** The process of systematic learning, stakeholder mapping, alignment diagnosis, and coalition building that Watkins describes is not just transition methodology — it is a template for ongoing organisational effectiveness. The best senior leaders use their own transition as an opportunity to model and institutionalise these practices.

**Why this principle is often skipped:**

By the time leaders reach principle 10, they are often at day 75 or 80, dealing with the accumulation of decisions deferred from the first 60 days, managing team dynamics that have become clearer, and navigating the first real test of their coalition. The temptation is to treat "accelerate everyone" as aspirational — something to do when things settle down. Watkins' consistent finding is that "things settling down" is an illusion: the opportunity window for embedding systemic learning capability is the first 90 days, not the next organisational development cycle.

**What to do:**

1. **Share your learning methodology with your team.** Be explicit about the listening approach, stakeholder mapping, and diagnostic frameworks you used. Encourage your direct reports to apply them in their own roles. This is the most scalable leadership development investment you can make.

2. **Build transition support for your direct reports explicitly.** Ask each direct report: "What is the single most important transition or change you are navigating right now? What support do you need?" Make this a standing agenda item.

3. **Create a team learning rhythm.** Beyond individual transitions, build the habit of collective learning into the team's operating rhythm — regular retrospectives, honest debriefs after major decisions or projects, and explicit acknowledgement of what is not working.

4. **Model intellectual humility visibly.** The most powerful signal a senior leader can send to their team is demonstrating that they continue to learn, change their mind based on evidence, and acknowledge uncertainty. This permission travels rapidly through an organisation.

5. **Use your onboarding experience to improve the system.** Before the memory fades, document what you found most and least useful about the onboarding experience. Share this with HR, your manager, or the relevant stakeholders. Your transition is a data point for improving the organisation's ability to bring in future leaders.

**Common mistakes to avoid:**

- **Treating team member transitions as routine HR process.** Org changes, promotions, and role expansions are transitions that deserve the same investment as the leader's own onboarding. They rarely receive it.
- **Expecting team members to absorb your energy and pace without the same preparation.** If you've done rigorous transition preparation, your team has not necessarily done the same. The gap in readiness shows up as misalignment.
- **Missing the leverage of your own transition as a teaching moment.** The early months are rare windows of organisational attention. Use them to embed practices that will outlast your own transition period.

> **Key Insight:** "Leadership transitions are the defining moment in an individual's career. But they are also the defining moment for the organisation. Leaders who use their own transition to build the organisation's transition capability leave a compounding legacy." — Michael Watkins, *The First 90 Days*`,
    sources: [
      'Watkins, M. (2013). *The First 90 Days*. HBR Press.',
      'McKinsey & Company (2018). *Successfully transitioning to new leadership roles*.',
      'Senge, P. (1990). *The Fifth Discipline*. Doubleday.',
    ],
  },
];

export const TASK_ARTICLE_MAP: Record<string, string> = {
  'prepare-learn': 'prepare-yourself',
  'learning-learn': 'accelerate-your-learning',
  'situation-learn': 'match-strategy-to-situation',
  'negotiate-learn': 'negotiate-success',
  'early-wins-build': 'secure-early-wins',
  'alignment-build': 'achieve-alignment',
  'team-build': 'build-your-team',
  'coalitions-deliver': 'create-coalitions',
  'balance-deliver': 'keep-your-balance',
  'accelerate-deliver': 'accelerate-everyone',
};

export const TASK_TITLE_ARTICLE_MAP: Array<{ keywords: string[]; articleId: string }> = [
  { keywords: ['prepare', 'audit', 'transition audit', 'identity', 'archetype'], articleId: 'prepare-yourself' },
  { keywords: ['learning', 'listening', 'historian', 'hypothes', 'intelligence brief'], articleId: 'accelerate-your-learning' },
  { keywords: ['stars', 'diagnos', 'situation', 'turnaround', 'start-up', 'realignment'], articleId: 'match-strategy-to-situation' },
  { keywords: ['negotiate', 'boss', 'manager', 'expectation', 'decision rights', 'mandate'], articleId: 'negotiate-success' },
  { keywords: ['early win', 'early wins', 'credibility', 'win target'], articleId: 'secure-early-wins' },
  { keywords: ['alignment', 'align', 'structure', 'misalignment', 'diagnostic'], articleId: 'achieve-alignment' },
  { keywords: ['team', 'direct report', 'assessment', 'competence', 'cohesion'], articleId: 'build-your-team' },
  { keywords: ['coalition', 'stakeholder', 'peer', 'lateral', 'influence map'], articleId: 'create-coalitions' },
  { keywords: ['balance', 'stress', 'self', 'reflect', 'wellbeing', 'recovery', 'energy'], articleId: 'keep-your-balance' },
  { keywords: ['accelerate everyone', 'retrospective', 'onboarding', 'intellectual humility'], articleId: 'accelerate-everyone' },
];

export function getArticleForTask(title: string, category: string, phase: string): string | null {
  const lower = title.toLowerCase();
  for (const mapping of TASK_TITLE_ARTICLE_MAP) {
    if (mapping.keywords.some(k => lower.includes(k))) {
      return mapping.articleId;
    }
  }
  const key = `${category}-${phase}`;
  return TASK_ARTICLE_MAP[key] ?? null;
}
