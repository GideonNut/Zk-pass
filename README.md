# GitHub Contributions Verifier with zkPass

### Overview

This project allows users to verify their GitHub contributions securely using zkPass. By leveraging the zkPass technology, users can prove their contribution count to GitHub repositories without revealing sensitive personal data.

### Features

- **GitHub Contribution Verification**: Users can verify they have made a certain number of contributions to a specific GitHub repository.
- **Privacy First**: Verification happens through zkPass, ensuring that no sensitive information (e.g., login credentials or GitHub ID) is exposed.
- **Easy Integration**: Leverages the GitHub GraphQL API to fetch user contribution data and the zkPass SDK for zero-knowledge proof generation.

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- zkPass TransGate Browser Extension ([Download here](https://zkpass.io))
- A valid GitHub account with contributions to the targeted repository

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/github-contributions-verifier.git
   cd github-contributions-verifier
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **zkPass Setup**

   Install the zkPass SDK:

   ```bash
   npm install @zkpass/transgate-js-sdk
   ```

   Or:

   ```bash
   yarn add @zkpass/transgate-js-sdk
   ```

### Usage

1. **Configure the App**

   Open the main JavaScript file (e.g., `app.js`) and configure your `schemaId` and `appId`. These values will be provided by zkPass when you create your schema and register your app.

   ```javascript
   const schemaId = "your-schema-id";
   const appId = "your-app-id";
   ```

2. **Running the Application**

   Start the application locally:

   ```bash
   npm start
   ```

   Visit `http://localhost:3000` in your browser to test the GitHub contribution verification process.

3. **GitHub Verification Process**

   - Click "Sign in with GitHub" to log in with your GitHub account.
   - Once logged in, click the "Start" button to initiate the verification process.
   - zkPass will guide you through the verification steps, and your contribution data will be securely verified without revealing personal information.

### How It Works

- **GitHub API**: This project utilizes the GitHub GraphQL API to fetch the user's contribution history.
- **zkPass Integration**: zkPass ensures that proof of contributions is verified using zero-knowledge cryptography without revealing user details like their GitHub ID or full contribution history.
- **Zero-Knowledge Proof**: After the user logs in and zkPass collects their contribution data, it generates a proof that meets the specified contribution condition (e.g., 10+ contributions).

### Example Schema

This project uses the following schema to verify GitHub contributions:

```json
{
  "issuer": "GitHub",
  "desc": "A global platform for developers to contribute to code repositories and collaborate on software projects.",
  "website": "https://docs.github.com/en/graphql/overview/explorer",
  "APIs": [
    {
      "host": "graphql.github.com",
      "intercept": {
        "url": "graphql/proxy",
        "method": "POST"
      },
      "override": {
        "body": [
          {
            "query": "{viewer{login id}}",
            "verify": true
          }
        ]
      },
      "nullifier": "data|viewer|id"
    },
    {
      "host": "graphql.github.com",
      "intercept": {
        "url": "graphql/proxy",
        "method": "POST"
      },
      "override": {
        "body": [
          {
            "query": "{user(login: \"@{=,0|0}\"){login contributionsCollection(to: \"2024-04-20T00:00:00\"){contributionCalendar{totalContributions}}}}"
          }
        ]
      },
      "assert": [
        {
          "key": "data|user|login",
          "value": "@{=,0|0}",
          "operation": "="
        },
        {
          "key": "data|user|contributionsCollection|contributionCalendar|totalContributions",
          "value": "10",
          "operation": ">="
        }
      ]
    }
  ],
  "HRCondition": [
    "10+ GitHub contributions within a year up until April 20, 2024"
  ]
}
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request, or open an issue if you have any suggestions or find bugs.
