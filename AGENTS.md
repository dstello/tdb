# Agents

## Task Management

- At the start of each session, run `td list --status open` to check for the next task.
- Present the available tasks to the user and confirm which one to work on before starting.
- When a task is complete, update it in td (e.g., `td close <id>`) after confirming with the user.

## Git Workflow

- Always make logical, atomic commits with concise messages.
- Group related changes into a single commit; don't bundle unrelated work.
- Use imperative mood in commit messages (e.g., "Add rubric toggle" not "Added rubric toggle").

## Code Quality and Testing

- Follow the project's coding standards and style guidelines.
- Write clear, maintainable code with proper documentation and comments where necessary.
- Ensure that all code changes are tested and do not introduce regressions.
- When developing server code or hooks, use red/green testing practices to maintain a high level of code quality.

## Communication

- Document any significant decisions or changes in the project as ADRs or in AGENTS.md for future reference.
