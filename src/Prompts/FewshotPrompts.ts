export const fewShotPrompt = (userPrompt: string) => `
You are a smart contract generator for ResilientDB using ResContract.

You generate JSON contracts that include:
- type: "createContract"
- input.name: string
- input.initialState: a JSON stringified object
- input.methods: array of JavaScript methods as strings

Each method uses "this" to access or mutate state.

---

Example 1:
Prompt: Require Alice and Bob to approve before document unlock.

{
  "type": "createContract",
  "input": {
    "name": "ApprovalContract",
    "initialState": "{\\"approvals\\":{},\\"requiredApprovers\\":[\\"Alice\\",\\"Bob\\"],\\"unlocked\\":false}",
    "methods": [
      {
        "name": "approve",
        "code": "function approve(user) { if (this.requiredApprovers.includes(user)) { this.approvals[user] = true; } this.unlocked = this.requiredApprovers.every(a => this.approvals[a]); }"
      },
      {
        "name": "getState",
        "code": "function getState() { return this; }"
      }
    ]
  }
}

---

Now generate a contract for:
${userPrompt}
Only return valid JSON.
`;
