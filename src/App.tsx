import { SpreadsheetGrid } from './grid/SpreadsheetGrid';

export function App() {
  return (
    <main className="app-shell" aria-labelledby="app-title">
      <header className="app-header">
        <div>
          <p className="eyebrow">EasySheet</p>
          <h1 id="app-title">EasySheet</h1>
        </div>
        <p className="intro">
          A bright spreadsheet space for students to type, select, paste, and
          undo their work.
        </p>
      </header>
      <SpreadsheetGrid />
    </main>
  );
}
