import {
  Activity,
  BarChart3,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  MonitorUp,
  Save,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { BigButton } from './components/BigButton';
import { Dialog } from './components/Dialog';
import { DropdownMenu } from './components/DropdownMenu';
import { IconButton } from './components/IconButton';
import { Toast } from './components/Toast';
import { Tooltip } from './components/Tooltip';
import { SpreadsheetGrid } from './grid/SpreadsheetGrid';
import { PictureGraph } from './picturegraph/PictureGraph';

type DialogKind = 'activity' | 'help' | null;

const toolbarMenus = [
  {
    label: 'File',
    items: ['New sheet', 'Open file', 'Save local copy'],
  },
  {
    label: 'Edit',
    items: ['Undo', 'Copy', 'Paste'],
  },
  {
    label: 'Insert',
    items: ['Formula', 'Picture graph', 'Note'],
  },
  {
    label: 'Chart',
    items: ['Bar chart', 'Line chart', 'Pie chart', 'Scatter plot'],
  },
  {
    label: 'Activities',
    items: ['Try an activity', 'Teacher ideas', 'Sample data'],
  },
  {
    label: 'Present',
    items: ['Start presentation', 'Whiteboard view'],
  },
  {
    label: 'Help',
    items: ['Quick help', 'Keyboard help', 'About EasySheet'],
  },
];

export function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [dialogKind, setDialogKind] = useState<DialogKind>(null);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 2200);
  }

  function handleMenuAction(label: string) {
    if (label === 'Quick help' || label === 'About EasySheet') {
      setDialogKind('help');
      return;
    }

    if (label === 'Try an activity' || label === 'Sample data') {
      setDialogKind('activity');
      return;
    }

    showToast(`${label} will be built in a later module.`);
  }

  return (
    <main className="app-shell" aria-labelledby="app-title">
      <header className="app-header">
        <div>
          <p className="eyebrow">EasySheet</p>
          <h1 id="app-title">EasySheet</h1>
        </div>
        <div className="header-actions" aria-label="Quick actions">
          <Tooltip text="Start a new classroom sheet">
            <IconButton
              icon={<FilePlus2 aria-hidden="true" size={22} />}
              onClick={() => showToast('New sheet ready.')}
            >
              New
            </IconButton>
          </Tooltip>
          <Tooltip text="Open a spreadsheet file">
            <IconButton
              icon={<FolderOpen aria-hidden="true" size={22} />}
              onClick={() => showToast('File opening arrives in Module 8.')}
            >
              Open
            </IconButton>
          </Tooltip>
          <Tooltip text="Save work to this device">
            <IconButton
              icon={<Save aria-hidden="true" size={22} />}
              onClick={() => showToast('Local saving arrives in Module 9.')}
            >
              Save
            </IconButton>
          </Tooltip>
        </div>
      </header>

      <nav className="top-toolbar" aria-label="Main toolbar">
        {toolbarMenus.map((menu) => (
          <DropdownMenu
            items={menu.items.map((item) => ({
              label: item,
              onSelect: () => handleMenuAction(item),
            }))}
            key={menu.label}
            label={menu.label}
          />
        ))}
      </nav>

      <SpreadsheetGrid />
      <PictureGraph />

      {isSplashVisible ? (
        <section
          aria-labelledby="welcome-title"
          aria-modal="true"
          className="splash-backdrop"
          role="dialog"
        >
          <div className="splash-panel">
            <p className="eyebrow">Welcome</p>
            <h2 id="welcome-title">EasySheet</h2>
            <p className="splash-copy">
              Big cells, bright controls, and simple tools for student data
              work.
            </p>
            <div className="splash-actions">
              <BigButton
                icon={<FilePlus2 aria-hidden="true" size={24} />}
                onClick={() => {
                  setIsSplashVisible(false);
                  showToast('New sheet ready.');
                }}
              >
                New Sheet
              </BigButton>
              <BigButton
                icon={<FolderOpen aria-hidden="true" size={24} />}
                variant="secondary"
                onClick={() => showToast('File opening arrives in Module 8.')}
              >
                Open a File
              </BigButton>
              <BigButton
                icon={<Sparkles aria-hidden="true" size={24} />}
                variant="secondary"
                onClick={() => setDialogKind('activity')}
              >
                Try an Activity
              </BigButton>
            </div>
          </div>
        </section>
      ) : null}

      <Dialog
        isOpen={dialogKind === 'activity'}
        title="Try an Activity"
        onClose={() => setDialogKind(null)}
      >
        <div className="dialog-grid">
          <article>
            <Activity aria-hidden="true" size={28} />
            <h3>Class Survey</h3>
            <p>Collect favorites, count totals, and build a chart next.</p>
          </article>
          <article>
            <BarChart3 aria-hidden="true" size={28} />
            <h3>Weather Data</h3>
            <p>Type daily temperatures and compare the numbers.</p>
          </article>
        </div>
      </Dialog>

      <Dialog
        isOpen={dialogKind === 'help'}
        title="EasySheet Help"
        onClose={() => setDialogKind(null)}
      >
        <div className="help-list">
          <p>Use arrow keys to move around the sheet.</p>
          <p>Press Enter to edit a selected cell.</p>
          <p>Paste a copied table to fill many cells at once.</p>
          <p>Use Undo when you want to try again.</p>
        </div>
      </Dialog>

      <Toast message={toastMessage} />

      <div className="presentation-hint" aria-hidden="true">
        <MonitorUp size={20} />
        <span>Presentation tools arrive in a later module.</span>
        <HelpCircle size={20} />
      </div>
    </main>
  );
}
