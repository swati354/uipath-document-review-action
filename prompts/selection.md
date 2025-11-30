# Template Selection

UiPath Action App template for Human-in-the-Loop (HITL) workflows with Action Center integration.

**Use for:** Action apps, escalation apps, Action Center tasks, HITL (Human-in-the-Loop) workflows, coded action apps, task forms, approval workflows, review interfaces, human validation screens, manual intervention UIs.

**Avoid for:** Dashboards without human tasks, monitoring-only apps, static reports, apps that don't require user input/decisions, process automation without human interaction.

**Includes:**
- Pre-configured UiPath SDK with Action Center TaskEventsService
- React hooks for Action Center communication (useActionContext)
- Action schema types and validation
- Outcome button components for task completion
- Form components that sync with Action Center data
- Theme and language change listeners
- Token refresh handling

**Key Features:**
- Communicates with Action Center via postMessage events
- Supports inputs (read-only data from automation)
- Supports outputs (data user provides)
- Supports inOuts (editable pre-filled data)
- Supports outcomes (user decisions like Approve/Reject)
- Real-time data sync with Action Center
- Automatic token refresh handling

**Keywords:** action app, escalation app, action center, HITL, human in the loop, task form, approval, review, manual task, coded action, human validation
