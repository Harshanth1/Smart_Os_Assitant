
export enum CommandType {
    OPEN_APP = 'OPEN_APP',
    WRITE_FILE = 'WRITE_FILE',
    CREATE_CONTENT = 'CREATE_CONTENT',
    TOGGLE_SETTING = 'TOGGLE_SETTING',
    SEARCH_WEB = 'SEARCH_WEB',
    CREATE_DIRECTORY = 'CREATE_DIRECTORY',
    DELETE_FILE = 'DELETE_FILE',
    COPY_FILE = 'COPY_FILE',
    UNKNOWN = 'UNKNOWN',
    GREETING = 'GREETING',
}

export interface CommandAction {
    command: CommandType;
    parameters: {
        appName?: string;
        fileName?: string;
        fileContent?: string;
        topic?: string;
        settingName?: 'WiFi' | 'Bluetooth';
        settingValue?: boolean;
        query?: string;
        directoryName?: string;
        filePath?: string;
        sourcePath?: string;
        destinationPath?: string;
    };
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: CommandAction;
}