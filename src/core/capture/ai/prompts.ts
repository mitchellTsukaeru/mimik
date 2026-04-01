export const STEP_DESCRIPTION_PROMPT = `You are describing steps in a browser workflow guide. Given the following context about a user action on a web page, write a single concise sentence describing this step.

{{context}}

Examples of good descriptions:
- "Click the Submit button"
- "Enter email address in the Email field"
- "Select 'Admin' from the Role dropdown"
- "Navigate to the Settings page"

Write only the description, no preamble.`;

export const GUIDE_TITLE_PROMPT = `These are the steps of a browser workflow, with the page URL and description for each step:

{{steps}}

Write a specific, descriptive title for this workflow. The title should mention the application or website name and the specific task being performed. Be precise — reference specific pages, features, or items that were interacted with.

Examples:
- "Review Most-Commented claude-code Pull Requests"
- "Configure Slack Notification Preferences for #engineering"
- "Submit Expense Report in Workday"
- "Create New Repository in GitHub Organization"

Just the title, no quotes, no preamble.`;
