
import React from 'react';
import { type CommandAction, CommandType } from '../types';
import { CodeIcon } from './icons/CodeIcon';
import { FileIcon } from './icons/FileIcon';
import { GearIcon } from './icons/GearIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { InfoIcon } from './icons/InfoIcon';
import { FolderIcon } from './icons/FolderIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';

interface InterpretedActionProps {
  action: CommandAction;
}

const ActionIcon: React.FC<{ command: CommandType, className: string }> = ({ command, className }) => {
    switch(command) {
        case CommandType.OPEN_APP: return <TerminalIcon className={className} />;
        case CommandType.WRITE_FILE: return <FileIcon className={className} />;
        case CommandType.CREATE_CONTENT: return <PencilIcon className={className} />;
        case CommandType.TOGGLE_SETTING: return <GearIcon className={className} />;
        case CommandType.SEARCH_WEB: return <SearchIcon className={className} />;
        case CommandType.CREATE_DIRECTORY: return <FolderIcon className={className} />;
        case CommandType.DELETE_FILE: return <TrashIcon className={className} />;
        case CommandType.COPY_FILE: return <CopyIcon className={className} />;
        case CommandType.GREETING: return <InfoIcon className={className}/>;
        default: return <CodeIcon className={className} />;
    }
}

const InterpretedAction: React.FC<InterpretedActionProps> = ({ action }) => {
  if (action.command === CommandType.GREETING) {
      return null; // Don't show a card for simple greetings
  }

  const parameters = Object.entries(action.parameters).filter(([, value]) => value !== undefined && value !== null);

  return (
    <div className="max-w-md bg-slate-800/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 shadow-lg">
      <div className="flex items-center mb-2">
        <ActionIcon command={action.command} className="w-4 h-4 mr-2 text-cyan-400" />
        <span className="font-bold uppercase tracking-wider text-cyan-400">
            {action.command.replace(/_/g, ' ')}
        </span>
      </div>
      {parameters.length > 0 ? (
        <ul className="space-y-1 font-mono bg-slate-900/50 p-2 rounded">
          {parameters.map(([key, value]) => (
            <li key={key} className="grid grid-cols-3 gap-2">
              <span className="text-slate-400 truncate">{key}:</span>
              <span className="col-span-2 text-slate-100 break-words">
                {typeof value === 'boolean' ? value.toString() : value}
              </span>
            </li>
          ))}
        </ul>
      ) : (
         action.command !== CommandType.UNKNOWN && <p className="font-mono text-slate-400 italic">No parameters required.</p>
      )}
    </div>
  );
};

export default InterpretedAction;