# THE SOCIAL LADDER

A replayable 3D sociology board game about **systems, choices, chance, social capital, structural barriers, and unequal starting conditions**.

## Play

GitHub Pages path:

`https://changeforgood-del.github.io/gn/sociology-board-game/`

## Visible city board and multiplayer

- The board is built into the page, so it remains visible even when external 3D libraries fail to load.
- The 36-space city shows under-resourced, working-class, middle-income, and wealthy districts with distinct buildings and colors.
- Supports 1–4 local pass-and-play players, each with a colored moving piece, individual stats, position, turn count, and timeline.

## Core design

Players create a social location using:

- Race / ethnicity
- Starting socioeconomic class
- Gender
- Neighborhood resource level
- Disability status
- Immigration context

Race and identity **do not change intelligence, morality, effort, skill, or inherent ability**. They alter only selected mechanics representing *exposure to institutions, discrimination, accessibility barriers, social expectations, neighborhood opportunity, and unequal treatment*.

## Life indicators

Every character tracks:

- Money
- Stability
- Health
- Social capital
- Stress
- Opportunity

The objective is not simply to become rich. Players must manage several dimensions of life at the same time, and many decisions create tradeoffs.

## Scenario systems

The current game includes scenarios involving:

- Education and advanced-course gatekeeping
- Hiring and "culture fit"
- Housing applications and screening
- Health, sick leave, and job flexibility
- Encounters with policing/public-space authority
- Family caregiving
- College debt
- Informal professional networks
- Gendered status expectations
- Disability accommodations
- Emergency expenses and wealth buffers
- Neighborhood organizing and collective action
- Bureaucratic paperwork
- Transportation failure
- Random opportunity

## How structural bias works

Some scenario choices use a `bias` risk. The probability is influenced by the player's combined social location. This is a **game abstraction**, not an individual prediction. The model is intentionally designed so that identity changes how systems may respond to the player rather than giving the player stereotyped personality traits.

The final screen explicitly reminds players that the simulation does not imply that everyone with the same identity has the same life experience.

## Replayability

- Random dice movement
- Random scenarios
- Branching decisions
- Probabilistic outcomes
- Different starting resources
- Intersectional structural-exposure mechanic
- Moving/rotating 3D board
- Multiple end-state summaries

Try replaying with the same decisions but a different social location, then compare the timelines. Also replay with the same social location and different decisions to see the effect of agency and luck.

## Technology

- Single-page static web game
- HTML/CSS/JavaScript
- Three.js loaded from jsDelivr
- No database or login required
- Mobile and desktop responsive
- Deployable directly through GitHub Pages

## Educational use

This is best treated as a discussion simulator rather than a scientific calculator. A classroom or workshop can pause after each scenario and ask:

1. What part of this outcome came from choice?
2. What part came from resources already available?
3. What part came from institutions or other people?
4. What role did luck play?
5. Which policy or collective intervention could change the rules rather than only changing the individual's behavior?

## Future expansion ideas

The event deck can be expanded with scenarios about criminal-legal history, language access, colorism, family wealth, school funding, environmental exposure, redlining, unionization, childcare, voting access, public benefits, rural/urban geography, age, religion, digital access, healthcare coverage, and intergenerational wealth.
