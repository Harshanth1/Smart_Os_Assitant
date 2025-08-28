
import React from 'react';
import { TerminalIcon } from './icons/TerminalIcon';
import { PencilIcon } from './icons/PencilIcon';
import { GearIcon } from './icons/GearIcon';
import { FolderIcon } from './icons/FolderIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';

interface Suggestion {
    text: string;
    icon: React.ElementType;
}

const suggestions: Suggestion[] = [
    { text: 'Open Chrome', icon: TerminalIcon },
    { text: 'Create a folder named "Projects"', icon: FolderIcon },
    { text: 'Write an essay about the solar system', icon: PencilIcon },
    { text: 'Delete the file "old_notes.txt"', icon: TrashIcon },
    { text: 'Copy "image.jpg" to "backups/"', icon: CopyIcon },
    { text: 'Turn on WiFi', icon: GearIcon },
];

interface CommandSuggestionsProps {
    onSelectSuggestion: (text: string) => void;
}

const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ onSelectSuggestion }) => {
    return (
        <div className="px-0 sm:px-0">
            <p className="text-sm text-slate-400 mb-3 text-center">Or try one of these suggestions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={suggestion.text}
                        onClick={() => onSelectSuggestion(suggestion.text)}
                        className={`text-left p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${suggestions.length % 2 !== 0 && index === suggestions.length - 1 ? 'sm:col-span-2' : ''}`}
                    >
                        <div className="flex items-center">
                            <suggestion.icon className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-200 text-sm">{suggestion.text}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CommandSuggestions;