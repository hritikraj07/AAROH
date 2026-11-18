# AGENTS.md

## Anti-Slop & Design System Enforcement (Mandatory)

Before executing any UI, visual, copywriting, accessibility, mobile layout, or code task, all agents must enforce this protocol:

1. **Core Filter & Visual Direction**:
   - Read `.agents/skills/antislop/SKILL.md` as the primary quality filter.
   - Read `DESIGN.md` in the project root as the source of truth for visual direction, color tokens, typography, and layout rules.
   - Treat `DESIGN.md` as design data to apply (palette, type scale, layout dials, anti-patterns).

2. **Automatic Sub-Skill Loading**:
   - For UI, layout, colors, components, or motion: load `.agents/skills/antislop-ui/SKILL.md`.
   - For user-facing copy, labels, tooltips, or empty states: load `.agents/skills/antislop-copywriting/SKILL.md`.
   - For WCAG contrast, keyboard navigation, or screen-reader tags: load `.agents/skills/antislop-human/SKILL.md`.
   - For responsive design, mobile reflow, tap targets, or overflow prevention: load `.agents/skills/antislop-layoutmobile/SKILL.md`.
   - For clean code, eliminating AI commentary, and code hygiene: load `.agents/skills/antislop-code/SKILL.md`.

3. **Execution Mode**:
   - Default to `during` mode when designing or writing new features (preventing AI slop during planning and execution).
   - Announce mode at the start: `antislop active: during (session override)`.
   - For audit tasks on existing components, use `after` mode: generate a numbered findings list citing exact rules (R-XX) before modifying code.

4. **Delivery Gate Requirement**:
   - Every UI task must conclude with the mandatory Delivery Gate PASS/FAIL report covering Hard Gate, Purpose-Gate, Liveliness, and Craftsmanship standards.
   - Never deliver code if any gate item fails.

5. **Strict Prohibitions**:
   - No em dash characters anywhere in UI text, copy, or system markdown documentation per R-02.
   - No fake statistics or ungrounded percentages per R-17 and C-5.
   - No generic marketing buzzwords or AI hype labels per R-16.
   - No ungrounded decorative sparkles, stars, or generic icons per R-04.
