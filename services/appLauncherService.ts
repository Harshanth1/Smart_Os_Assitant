// This service handles launching applications on Windows
// Note: In a browser environment, we can't directly execute system commands
// Instead, we use special URLs and browser APIs where possible

interface AppLaunchResult {
  success: boolean;
  message: string;
}

// Common Windows applications and their URLs or URI protocols
const commonApps: Record<string, string> = {
  // Browsers
  'chrome': 'https://www.google.com',
  'google chrome': 'https://www.google.com',
  'edge': 'microsoft-edge:',
  'microsoft edge': 'microsoft-edge:',
  'firefox': 'https://www.mozilla.org/firefox',
  'mozilla firefox': 'https://www.mozilla.org/firefox',
  'brave': 'https://brave.com',
  'brave browser': 'https://brave.com',
  'safari': 'https://www.apple.com/safari/',
  'opera': 'https://www.opera.com/',
  
  // Search engines and web portals
  'google': 'https://www.google.com',
  'bing': 'https://www.bing.com',
  'duckduckgo': 'https://duckduckgo.com',
  'yahoo': 'https://www.yahoo.com',
  
  // Media and entertainment
  'spotify': 'spotify:',
  'youtube': 'https://www.youtube.com',
  'netflix': 'https://www.netflix.com',
  'disney plus': 'https://www.disneyplus.com',
  'disney+': 'https://www.disneyplus.com',
  'hulu': 'https://www.hulu.com',
  'prime video': 'https://www.primevideo.com',
  'amazon prime': 'https://www.primevideo.com',
  'hbo max': 'https://www.hbomax.com',
  'twitch': 'https://www.twitch.tv',
  
  // Social media
  'facebook': 'https://www.facebook.com',
  'instagram': 'https://www.instagram.com',
  'twitter': 'https://www.twitter.com',
  'x': 'https://www.twitter.com',
  'linkedin': 'https://www.linkedin.com',
  'pinterest': 'https://www.pinterest.com',
  'reddit': 'https://www.reddit.com',
  'tiktok': 'https://www.tiktok.com',
  
  // Productivity and email
  'gmail': 'https://mail.google.com',
  'google mail': 'https://mail.google.com',
  'maps': 'https://maps.google.com',
  'google maps': 'https://maps.google.com',
  'google drive': 'https://drive.google.com',
  'drive': 'https://drive.google.com',
  'google docs': 'https://docs.google.com',
  'docs': 'https://docs.google.com',
  'google sheets': 'https://sheets.google.com',
  'sheets': 'https://sheets.google.com',
  'dropbox': 'https://www.dropbox.com',
  'onedrive': 'https://onedrive.live.com',
  
  // Communication
  'teams': 'https://teams.microsoft.com',
  'microsoft teams': 'https://teams.microsoft.com',
  'zoom': 'zoommtg:',
  'slack': 'slack:',
  'discord': 'discord:',
  'whatsapp': 'https://web.whatsapp.com',
  'telegram': 'https://web.telegram.org',
  'skype': 'skype:',
  'google meet': 'https://meet.google.com',
  'meet': 'https://meet.google.com',
  
  // Microsoft apps
  'word': 'ms-word:',
  'microsoft word': 'ms-word:',
  'excel': 'ms-excel:',
  'microsoft excel': 'ms-excel:',
  'powerpoint': 'ms-powerpoint:',
  'microsoft powerpoint': 'ms-powerpoint:',
  'outlook': 'ms-outlook:',
  'microsoft outlook': 'ms-outlook:',
  'onenote': 'ms-onenote:',
  'microsoft onenote': 'ms-onenote:',
  
  // Special Windows apps
  'camera': 'microsoft.windows.camera:',
  'windows camera': 'microsoft.windows.camera:',
  'photos': 'ms-photos:',
  'windows photos': 'ms-photos:',
  'settings': 'ms-settings:',
  'windows settings': 'ms-settings:',
  'calculator': 'calculator:',
  'windows calculator': 'calculator:',
  'mail': 'mailto:',
  'windows mail': 'mailto:',
  'store': 'ms-windows-store:',
  'microsoft store': 'ms-windows-store:',
  'windows store': 'ms-windows-store:',
  
  // Windows applications (with web alternatives for browser environment)
  'file explorer': 'explorer:',
  'windows explorer': 'explorer:',
  'explorer': 'explorer:',
  'file browser': 'https://demo.files.gallery/',
  'files': 'https://demo.files.gallery/',
  'notepad': 'notepad:',
  'windows notepad': 'notepad:',
  'text editor': 'https://www.online-notepad.net/',
  'online notepad': 'https://www.online-notepad.net/',
  'calendar': 'https://calendar.google.com',
  'google calendar': 'https://calendar.google.com',
  
  // Programming tools
  'visual studio code': 'https://code.visualstudio.com/',
  'vscode': 'https://code.visualstudio.com/',
  'visual studio': 'https://visualstudio.microsoft.com/',
  'github': 'https://github.com/',
  'git': 'https://git-scm.com/',
  
  // Development and systems
  'terminal': 'about:blank?terminal-requested',
  'command prompt': 'about:blank?cmd-requested',
  'cmd': 'about:blank?cmd-requested',
  'powershell': 'about:blank?powershell-requested',
  'task manager': 'about:blank?task-manager-requested',
};

/**
 * Find similar app names for suggestions when an exact match isn't found
 */
function findSimilarApps(appName: string, maxSuggestions: number = 3): string[] {
  const normalizedInput = appName.toLowerCase().trim();
  
  // Don't suggest if input is too short
  if (normalizedInput.length < 2) return [];
  
  // Calculate similarity scores for each app name
  const similarityScores = Object.keys(commonApps).map(appKey => {
    // Check for partial matches
    const isPartialMatch = appKey.includes(normalizedInput) || normalizedInput.includes(appKey);
    
    // Calculate Levenshtein distance (simple version)
    let distance = 0;
    const maxLength = Math.max(appKey.length, normalizedInput.length);
    const minLength = Math.min(appKey.length, normalizedInput.length);
    
    for (let i = 0; i < minLength; i++) {
      if (appKey[i] !== normalizedInput[i]) distance++;
    }
    
    // Add penalty for length difference
    distance += (maxLength - minLength);
    
    // Boost score for partial matches
    const score = isPartialMatch ? distance * 0.5 : distance;
    
    return { appName: appKey, score };
  });
  
  // Sort by score (lower is better) and take top suggestions
  return similarityScores
    .sort((a, b) => a.score - b.score)
    .slice(0, maxSuggestions)
    .map(item => item.appName);
}

/**
 * Launches an application based on the provided name
 * In a web environment, we use special URLs and protocols where possible
 */
/**
 * Checks if an app is a Windows-specific application that might have browser limitations
 */
function isWindowsSpecificApp(appName: string): boolean {
  const windowsApps = [
    'explorer', 'file explorer', 'notepad', 'cmd', 'command prompt', 
    'powershell', 'terminal', 'task manager', 'control panel', 'registry editor'
  ];
  return windowsApps.includes(appName.toLowerCase().trim());
}

export async function launchApplication(appName: string): Promise<AppLaunchResult> {
  const normalizedAppName = appName.toLowerCase().trim();
  
  // Check if it's a common app we know how to launch
  const urlOrProtocol = commonApps[normalizedAppName];
  
  if (urlOrProtocol) {
    // Direct match found
    console.log(`Found exact match for "${appName}"`);
    return openUrlOrProtocol(urlOrProtocol, normalizedAppName);
  } else {
    // Try alternative names for the app
    const alternativeNames = getAppAlternativeNames(normalizedAppName);
    
    for (const altName of alternativeNames) {
      if (commonApps[altName]) {
        console.log(`Found match using alternative name: "${altName}" for "${appName}"`);
        return openUrlOrProtocol(commonApps[altName], altName);
      }
    }
    
    // Try to find if the app might be a variant of a known app
    const possibleMatches = Object.keys(commonApps).filter(key => 
      key.includes(normalizedAppName) || normalizedAppName.includes(key)
    );
    
    if (possibleMatches.length === 1) {
      // Found a single close match, use it
      console.log(`Found close match for "${appName}": "${possibleMatches[0]}"`);
      return openUrlOrProtocol(commonApps[possibleMatches[0]], possibleMatches[0]);
    }
    
    // If we have multiple potential matches, check which one is the closest
    if (possibleMatches.length > 1) {
      // Sort by length difference to find closest match
      possibleMatches.sort((a, b) => 
        Math.abs(a.length - normalizedAppName.length) - Math.abs(b.length - normalizedAppName.length)
      );
      const bestMatch = possibleMatches[0];
      
      // If the best match is very close, use it
      if (bestMatch.includes(normalizedAppName) || normalizedAppName.includes(bestMatch)) {
        console.log(`Found best match among several possibilities for "${appName}": "${bestMatch}"`);
        return openUrlOrProtocol(commonApps[bestMatch], bestMatch);
      }
    }
    
    // If no direct matches, get suggestions for similar apps
    const similarApps = findSimilarApps(normalizedAppName);
    
    // Create a message with suggestions if available
    let suggestionMessage = '';
    if (similarApps.length > 0) {
      const formattedSuggestions = similarApps.map(app => `"${app}"`).join(', ');
      suggestionMessage = ` Did you mean: ${formattedSuggestions}?`;
    }
    
    // Check if this is a Windows-specific app with browser limitations
    if (isWindowsSpecificApp(normalizedAppName)) {
      console.log(`"${appName}" is a Windows-specific app that may have browser limitations.`);
      
      // We'll still try to open it, but with a more specific message
      const result = await openUrlOrProtocol(
        commonApps[normalizedAppName] || 'about:blank?app-requested', 
        normalizedAppName
      );
      
      result.message = `I've tried to open ${appName}. Since this is a Windows-specific application, it may not work properly in a browser environment. ${result.message}`;
      
      return result;
    }
    
    // For unknown apps, try a web search for the app
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(normalizedAppName + ' app')}`;
    console.log(`No match for "${appName}". Searching the web instead.${suggestionMessage}`);
    
    const result = await openUrlOrProtocol(searchUrl, normalizedAppName);
    
    // Add suggestions to the message if we have any
    if (similarApps.length > 0) {
      result.message += suggestionMessage;
    }
    
    return result;
  }
}

// Keep track of recent app launches to prevent rapid repeated launches
const recentLaunches = new Map<string, number>();
const LAUNCH_COOLDOWN_MS = 3000; // 3 seconds cooldown between launches of the same app

/**
 * Attempts to find application aliases or alternative names
 * (e.g., "Google Chrome" might be searched as just "Chrome")
 */
function getAppAlternativeNames(appName: string): string[] {
  const normalizedName = appName.toLowerCase().trim();
  const alternatives = [normalizedName];
  
  // Add common prefixes/suffixes if they're not there already
  if (!normalizedName.includes('microsoft') && 
      ['word', 'excel', 'powerpoint', 'outlook', 'edge', 'teams'].includes(normalizedName)) {
    alternatives.push(`microsoft ${normalizedName}`);
  }
  
  if (!normalizedName.includes('google') && 
      ['chrome', 'mail', 'docs', 'sheets', 'drive', 'meet'].includes(normalizedName)) {
    alternatives.push(`google ${normalizedName}`);
  }
  
  if (!normalizedName.includes('windows') && 
      ['camera', 'photos', 'settings', 'explorer', 'notepad', 'calculator'].includes(normalizedName)) {
    alternatives.push(`windows ${normalizedName}`);
  }
  
  // Handle specific common cases
  const specificAlternatives: Record<string, string[]> = {
    'chrome': ['google chrome'],
    'browser': ['chrome', 'edge', 'firefox'],
    'files': ['file explorer', 'explorer'],
    'email': ['outlook', 'gmail', 'mail'],
    'video': ['youtube', 'netflix'],
    'music': ['spotify'],
    'text editor': ['notepad', 'word'],
    'spreadsheet': ['excel'],
    'presentation': ['powerpoint'],
    'chat': ['teams', 'discord', 'slack', 'whatsapp'],
    'messaging': ['whatsapp', 'telegram', 'messenger'],
    'video call': ['zoom', 'teams', 'meet'],
    'conference': ['zoom', 'teams', 'meet'],
    'document': ['word', 'google docs', 'docs'],
  };
  
  // Add any specific alternatives
  if (specificAlternatives[normalizedName]) {
    alternatives.push(...specificAlternatives[normalizedName]);
  }
  
  return [...new Set(alternatives)]; // Remove duplicates
}

/**
 * Try to open a URL or protocol
 */
function openUrlOrProtocol(urlOrProtocol: string, appName: string): Promise<AppLaunchResult> {
  return new Promise((resolve) => {
    try {
      // Implement cooldown to prevent rapid repeated launches
      const now = Date.now();
      const lastLaunchTime = recentLaunches.get(appName);
      
      if (lastLaunchTime && (now - lastLaunchTime) < LAUNCH_COOLDOWN_MS) {
        console.log(`Ignoring repeated launch request for ${appName} (cooldown active)`);
        resolve({
          success: true,
          message: `${appName} is already being opened.`
        });
        return;
      }
      
      // Record this launch attempt
      recentLaunches.set(appName, now);
      
      // After cooldown period, remove from recent launches
      setTimeout(() => {
        recentLaunches.delete(appName);
      }, LAUNCH_COOLDOWN_MS);
      
      console.log(`Launching ${appName} with URL/protocol: ${urlOrProtocol}`);
      
      // Handle special cases for Windows applications
      if (urlOrProtocol === 'explorer:') {
        // For File Explorer, we'll try multiple approaches
        
        // Approach 1: Try the explorer: protocol (may work in IE but not in modern browsers)
        try {
          const iframeEl = document.createElement('iframe');
          iframeEl.style.display = 'none';
          iframeEl.src = 'explorer:';
          document.body.appendChild(iframeEl);
          
          // Remove the iframe after a short delay
          setTimeout(() => {
            document.body.removeChild(iframeEl);
          }, 1000);
        } catch (error) {
          console.warn('Failed to open Explorer with iframe:', error);
        }
        
        // Approach 2: Try direct location change (likely to be blocked)
        try {
          // This will likely be blocked but we'll try anyway
          const explorerLink = document.createElement('a');
          explorerLink.href = 'explorer://';
          explorerLink.click();
        } catch (error) {
          console.warn('Failed to open Explorer with location change:', error);
        }
        
        // Approach 3: Try using the file:// protocol
        try {
          window.open('file:///', '_blank');
        } catch (error) {
          console.warn('Failed to open Explorer with file protocol:', error);
        }
        
        // Approach 4: Create a simple file browser interface
        const fileBrowserUrl = 'https://codepen.io/pen?template=VwzJzxB';
        window.open(fileBrowserUrl, '_blank');
        
        resolve({
          success: true,
          message: `I've tried to open File Explorer. Due to browser security restrictions, I've opened a simple file browser interface instead.`
        });
        return;
      }
      
      if (urlOrProtocol === 'notepad:') {
        // For Notepad, we can open a data URL with an empty text file
        const dataUrl = 'data:text/plain;charset=utf-8,';
        const notepadWindow = window.open(dataUrl, '_blank');
        if (notepadWindow) {
          try {
            notepadWindow.document.title = 'Notepad';
          } catch (e) {
            console.warn('Could not set document title for security reasons:', e);
          }
        }
        
        resolve({
          success: true,
          message: `Opened a text editor similar to Notepad. Due to browser restrictions, this is a web-based alternative.`
        });
        return;
      }
      
      // Try to open the URL or protocol in a new window/tab
      const newWindow = window.open(urlOrProtocol, '_blank');
      
      // Check if window was blocked by popup blocker
      if (newWindow === null) {
        console.warn('Popup blocked or protocol not supported:', urlOrProtocol);
        resolve({
          success: false,
          message: `I tried to open ${appName}, but it was blocked by your browser. Please allow popups for this site or use a different app.`
        });
      } else {
        // For some URI protocols that aren't supported in browser, newWindow might be 
        // non-null but still not work properly. There's no reliable way to detect this.
        resolve({
          success: true,
          message: `Opened ${appName} successfully.`
        });
      }
    } catch (error) {
      console.error('Error opening URL/protocol:', error);
      resolve({
        success: false,
        message: `Failed to open ${appName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
}
