# Backend knowledge endpoints pending

The requested administrative knowledge endpoints (batch import, schema updates, etc.) belong to the backend service (`quanton3d-bot`). This repository is the frontend site (`quanton3d-site`), so the backend code and MongoDB/RAG logic required for the implementation are not present here.

To complete the tasks:
- Switch to the backend repository (`quanton3d-bot`).
- Add the admin routes (`POST /admin/knowledge/import`, `GET /admin/knowledge/list`, etc.) with the existing authentication and embedding utilities.
- Update the document schema/validation to include `tags` (array) and optional `source`, keeping compatibility with the RAG pipeline.

No code changes were made here because the necessary backend modules are outside this project.
