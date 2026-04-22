# Godspeed SOP Assistant

Meet Clyde — an AI-powered assistant that lives in Slack and helps employees answer questions based strictly on the company's Standard Operating Procedures (SOPs).

Built with [Bolt for JavaScript](https://tools.slack.dev/bolt-js/) and [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) using models from [OpenAI](https://openai.com).

## App Overview

Clyde gives your team instant answers based on SOPs through three entry points:

* **Direct Messages** — Users message Clyde directly to ask a question. Clyde responds in-thread, maintaining context across follow-ups.
* **Channel @mentions** — Users mention `@Clyde` in any channel to get help without leaving the conversation.
* **Assistant Panel** — Users click _Add Agent_ in Slack, select Clyde, and ask their question.

Clyde uses the OpenAI `file_search` tool to query the uploaded Word/PDF documents and find the most relevant answers for the user.

## Setup

### SOP Documents (Data Preparation)

All the Standard Operating Procedure (SOP) documents are committed to this repository and live in the `data/sops` directory within a single zip file called `sops.zip`. Since these files are mostly static, they are included out-of-the-box.

If you ever need to update or add new SOPs:
1. Update the `sops.zip` archive with the new or modified `.docx` or `.doc` files.
2. Re-run the vector store setup script (explained below) which will automatically extract the zip file, upload the updated documents, and output a fresh Vector Store ID. Update your `.env` file with this new ID.

### OpenAI Setup

This app uses OpenAI's `gpt-4o-mini` model and the Assistants API `file_search` tool.

1. Create an API key from your [OpenAI dashboard](https://platform.openai.com/api-keys).
2. Save the OpenAI API key to `.env`:

```sh
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

3. Run the vector store setup script. This script will read the documents from `data/sops`, upload them to OpenAI, and create a new Vector Store:

```sh
npm install
npm run setup-vector-store
```

4. The script will output a Vector Store ID. Add it to your `.env` file:

```sh
OPENAI_VECTOR_STORE_ID=YOUR_VECTOR_STORE_ID
```

### Slack App Setup

Follow standard Bolt JS instructions to create your Slack App and obtain the tokens.

Save them to `.env`:

```sh
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
```

## Starting the app

There are two ways to run the app locally: using the Slack CLI (recommended for quick testing) or the standard Node.js start command.

### Using the Slack CLI (Quickstart)

The [Slack CLI](https://docs.slack.dev/ai/agent-quickstart) provides the fastest way to run and test the app locally in a Sandbox workspace. 

1. Install the Slack CLI and authenticate.
2. Run the application:
```sh
slack run
```
This will start the local server and automatically handle establishing the connection to your workspace.

### Using Node.js (Manual Setup)

If you've manually configured your tokens in the `.env` file:

```sh
npm install
npm start
```

## Interacting

Once Clyde is running, you can DM the bot or mention it in a channel and ask questions like "What is the procedure for handling a lost laptop?" and it will search the SOPs to provide an accurate answer.