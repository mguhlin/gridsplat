# Architecture Decisions

## 0001. Static React Application

- Status: Accepted
- Date: 2026-06-07

EasySheet is a static React, TypeScript, and Vite application. The browser handles application state and computation. There is no backend service for student work.

This keeps hosting simple, supports GitHub Pages, and avoids collecting student data by default.
