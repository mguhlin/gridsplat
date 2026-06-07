# Architecture Decisions

## 0001. Static React Application

- Status: Accepted
- Date: 2026-06-07

EasySheet is a static React, TypeScript, and Vite application. The browser handles application state and computation. There is no backend service for student work.

This keeps hosting simple, supports GitHub Pages, and avoids collecting student data by default.

## 0002. Custom Virtualized DOM Grid

- Status: Accepted
- Date: 2026-06-07

EasySheet uses a custom React DOM grid for the spreadsheet surface. The default sheet is 20x20 with large cells, and the component computes visible rows and columns from scroll position so the same approach can scale to larger classroom sheets without rendering every cell.

This keeps the grid child-centered and avoids adapting an adult-oriented commercial spreadsheet grid.
