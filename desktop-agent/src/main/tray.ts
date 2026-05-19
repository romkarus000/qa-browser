import { app, Menu, Tray, nativeImage, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { APP_VERSION, API_PORT } from '../shared/types';
import { getProfilesDir } from './config';
import { getLogFilePath } from './logger';
import { getActiveSessionSummaries } from '../browser/sessionManager';

let tray: Tray | null = null;

function resolveTrayIcon(): Electron.NativeImage {
  const candidates = [
    app.isPackaged
      ? path.join(process.resourcesPath, 'tray-icon.png')
      : path.join(__dirname, '..', '..', 'build', 'icon.png'),
    path.join(__dirname, '..', '..', 'build', 'icon.png'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return nativeImage.createFromPath(candidate);
    }
  }
  return nativeImage.createEmpty();
}

function buildMenu(onRestart: () => void): Menu {
  const sessions = getActiveSessionSummaries();
  const sessionItems =
    sessions.length > 0
      ? sessions.map((s) => ({
          label: `- ${s.profileName}`,
          enabled: false,
        }))
      : [{ label: '(none)', enabled: false }];

  return Menu.buildFromTemplate([
    { label: 'QA Desktop Agent', enabled: false },
    { type: 'separator' },
    { label: 'Status: Running', enabled: false },
    { label: `Port: ${API_PORT}`, enabled: false },
    { label: `Version: ${APP_VERSION}`, enabled: false },
    { type: 'separator' },
    { label: 'Active sessions:', enabled: false },
    ...sessionItems,
    { type: 'separator' },
    {
      label: 'Open logs',
      click: () => shell.showItemInFolder(getLogFilePath()),
    },
    {
      label: 'Open profiles folder',
      click: () => shell.openPath(getProfilesDir()),
    },
    {
      label: 'Restart agent',
      click: () => onRestart(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
}

export function createTray(onRestart: () => void): Tray {
  tray = new Tray(resolveTrayIcon());
  tray.setToolTip('QA Desktop Agent');
  tray.setContextMenu(buildMenu(onRestart));
  tray.on('click', () => tray?.popUpContextMenu());
  return tray;
}

export function refreshTray(onRestart: () => void): void {
  tray?.setContextMenu(buildMenu(onRestart));
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
