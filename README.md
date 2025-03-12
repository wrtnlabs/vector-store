# Getting Started

```tsx
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const selector = new AgenticaOpenAIVectorStoreSelector({
  provider: { api: openai, assistant: { id: assistant_id }, vectorStore: { id: vector_store_id } },
});

const agent = new Agentica({
  model: "chatgpt",
  vendor: { api: openai, model: "gpt-4o-mini" },
  controllers: [
    {
      protocol: "class",
      name: "vectorStore",
      application: typia.llm.application<AgenticaOpenAIVectorStoreSelector, "chatgpt">(),
      execute: selector,
    },
  ],
});
```

### Key Components and Their Roles

1. **Creating the OpenAI Instance:**

   ```tsx
   const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
   ```

   - This initializes the OpenAI API instance using your API key.

2. **Creating the AgenticaOpenAIVectorStoreSelector:**

   ```tsx
   const selector = new AgenticaOpenAIVectorStoreSelector({
     provider: { api: openai, assistant: { id: assistant_id }, vectorStore: { id: vector_store_id } },
   });
   ```

   - This selector receives an OpenAI API instance along with the pre-created assistant and vectorStore IDs.
   - Internally, the selector handles operations such as file upload, file listing, duplicate prevention (using SHA-256 hashing), and overall file management.
   - When provided, the optional store object enables more granular file management such as setting file priority and removal.

3. **Configuring the Agentica Agent:**

   ```tsx
   const agent = new Agentica({
     model: "chatgpt",
     vendor: { api: openai, model: "gpt-4o-mini" },
     controllers: [
       {
         protocol: "class",
         name: "vectorStore",
         application: typia.llm.application<AgenticaOpenAIVectorStoreSelector, "chatgpt">(),
         execute: selector,
       },
     ],
   });
   ```

   - This section creates an agent using the Agentica framework.
   - The agent uses the `chatgpt` model and leverages the OpenAI API as the backend.
   - The `controllers` array registers the AgenticaOpenAIVectorStoreSelector class as the controller for vector store functionality.
     - By setting `protocol: "class"`, the controller is built on a class-based approach and, with the help of the typia plugin, supports Function Calling.
     - The `execute` property passes the previously created `selector` instance to perform actual file management and query processing logic.

### Overall Flow Summary

- **API Initialization:** An API instance is created using the OpenAI API key.
- **VectorStore Selector Setup:** The selector is initialized with a provider object containing information about the assistant and vectorStore.
- **Agent Configuration:** The Agentica framework is used to register the vector store selector as a controller, enabling the agent to dynamically call external files and data when needed.

# VectorStore for Function Calling

This project transforms **VectorStore** from a simple file storage system into an open-source solution designed for agents to dynamically access external files and data on-demand.

It focuses on two crucial aspects of file management:

- **Duplicate Prevention via SHA-256 Hashing:**
  To prevent the same file from being added multiple times, every file upload undergoes SHA-256 hashing.
  This hash serves as a unique identifier for the file, and if a file with the same hash already exists, the system prevents a duplicate upload.
- **File Management through an Optional Store Object:**
  By passing a store object to the constructor, the system supports operations to add or remove files from the vector store.
  This feature goes beyond simple file addition or removal by enabling granular file management such as setting file priority and categorizing files, allowing both developers and users to effectively control the file workflow within the system.

---

## 1. Philosophy and Objectives

### Intelligent Memory System for Agents

- **Providing Complete Context:**
  Traditional AI systems generate responses based on the sequential transmission of entire conversation histories.
  However, this approach has limitations when handling large-scale data and real-time information retrieval.
  VectorStore is designed to supply agents with the necessary large-scale data in a single call, mimicking the way humans recall long-term memories all at once to formulate an answer.

### Dynamic File Management and Priority Setting

- **Dynamic File Addition and Removal:**
  The system is designed so that users can add or remove files at any time.
  Rather than simply storing files, the system uses the store object to determine whether a file should actually be integrated into the vector store through prioritized searching and management.
- **Granular File Management:**
  During file upload, the system calculates a unique checksum using SHA-256 hashing to prevent duplicate file uploads.
  This ensures file integrity and removes redundant files from the management pool, thereby increasing efficiency.

### Integration with Function Calling

- **Dynamic Tool Invocation:**
  VectorStore serves as a tool for Function Calling, allowing the agent to dynamically search and retrieve external files or data when required.
  This design enables the agent to access necessary information on-the-fly, rather than storing everything internally.

---

## 2. Design Patterns and Architectural Overview

### Overview of the AgenticaOpenAIVectorStoreSelector Class

This class consolidates all vector store-related tasks (file upload, file listing, duplicate prevention, file management, etc.) into a single selector.

- **Status Checking:**
  It provides an easy way to check the status and metadata (e.g., ID, name, file count) of the vector store connected to the agent.
- **Query Execution:**
  When a user submits a query, the selector creates a new conversation thread, prompting the agent to search for and retrieve relevant files and data for generating a response.
- **File Attachment and Duplicate Prevention:**
  During file attachment, the system computes a unique checksum via SHA-256 hashing.
  This checksum is used as the file's unique identifier, preventing duplicate uploads by halting the process if a file with the same hash exists.
- **Utilizing the Optional Store Object:**
  By providing a store object at construction, users can perform granular file management tasks such as adding/removing files and setting file priority.
  This feature empowers users to configure file management strategies beyond simple storage.

### File Processing and Integrity Verification

- **File Loading:**
  Files can be loaded via URLs or handled directly in ArrayBuffer format.
  This allows flexible data collection from various file sources.
- **Checksum Calculation:**
  Uploaded files are hashed using the SHA-256 algorithm.
  This hash is key to verifying file integrity and preventing duplicate uploads.

---

## 3. Overall System Flow

1. **File Upload Scenario:**
   - When a user uploads a file, the system loads the file data and generates a checksum using SHA-256 hashing.
   - The generated checksum is used to check if an identical file already exists; if it does not, the file is added to the vector store.
   - If an optional store object is provided, the file's priority or categorization criteria determine whether the file should be added, updated, or removed.
2. **Query Response Scenario:**
   - When the agent receives a query, VectorStore dynamically searches for relevant files and data, providing them to the agent to generate a response.
   - In this process, the agent can also invoke file management tools to reflect the latest file statuses.
3. **File Management and Priority Setting:**
   - Users can perform granular file management tasks—such as adding or removing files and setting priorities—using the store object.
   - This ensures that the system evolves from a simple file storage solution into an environment tailored to actual business workflows and user requirements.

---

## 4. Conclusion and Future Directions

This open-source solution empowers agents to dynamically retrieve and leverage external information in a human-like manner by combining a robust duplicate prevention mechanism (via SHA-256 hashing) with granular file management capabilities (through an optional store object).

Future directions include:

- **Enhanced Scalability and Flexibility:**
  We plan to integrate with various backend systems, enabling users to easily customize the system to their environments.
- **User-Friendly File Management:**
  Improvements in UI/UX will make tasks like file upload, duplicate verification, and priority setting more intuitive.
- **Intelligent Agent Implementation:**
  Our vision is to evolve agents beyond mere response generators into dynamic memory systems that effectively manage and utilize files and data.

---

This README is designed to clearly communicate the core concepts—duplicate prevention and advanced file management via a store object—while offering a comprehensive overview of the system's context and functionality. Feedback or suggestions for further modifications are welcome.
