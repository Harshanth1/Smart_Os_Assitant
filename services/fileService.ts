// This service handles file creation in a web-based environment
// Since we're in a browser context, we'll use downloadable files as our solution

interface FileCreationResult {
  success: boolean;
  message: string;
  fileUrl?: string;
}

// Define file types and their MIME types for content creation
const fileTypeMappings: Record<string, { mimeType: string, extension: string, template?: string }> = {
  // Text files
  'txt': { 
    mimeType: 'text/plain', 
    extension: '.txt' 
  },
  'text': { 
    mimeType: 'text/plain', 
    extension: '.txt' 
  },
  
  // Document formats
  'docx': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    extension: '.docx',
    // Redirects to Word Online
    template: 'https://office.live.com/start/Word.aspx?ui=en-US&rs=US' 
  },
  'doc': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    extension: '.docx',
    template: 'https://office.live.com/start/Word.aspx?ui=en-US&rs=US' 
  },
  'word': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    extension: '.docx',
    template: 'https://office.live.com/start/Word.aspx?ui=en-US&rs=US' 
  },
  
  // Spreadsheet formats
  'xlsx': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    extension: '.xlsx',
    template: 'https://office.live.com/start/Excel.aspx?ui=en-US&rs=US' 
  },
  'excel': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    extension: '.xlsx',
    template: 'https://office.live.com/start/Excel.aspx?ui=en-US&rs=US' 
  },
  'spreadsheet': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    extension: '.xlsx',
    template: 'https://office.live.com/start/Excel.aspx?ui=en-US&rs=US' 
  },
  
  // Presentation formats
  'pptx': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    extension: '.pptx',
    template: 'https://office.live.com/start/PowerPoint.aspx?ui=en-US&rs=US' 
  },
  'powerpoint': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    extension: '.pptx',
    template: 'https://office.live.com/start/PowerPoint.aspx?ui=en-US&rs=US' 
  },
  'presentation': { 
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    extension: '.pptx',
    template: 'https://office.live.com/start/PowerPoint.aspx?ui=en-US&rs=US' 
  },
  
  // PDF format
  'pdf': { 
    mimeType: 'application/pdf', 
    extension: '.pdf',
    template: 'https://www.adobe.com/acrobat/online/word-to-pdf.html' 
  },
  
  // Image formats
  'jpg': { mimeType: 'image/jpeg', extension: '.jpg' },
  'jpeg': { mimeType: 'image/jpeg', extension: '.jpeg' },
  'png': { mimeType: 'image/png', extension: '.png' },
  'gif': { mimeType: 'image/gif', extension: '.gif' },
  
  // Code/web formats
  'html': { mimeType: 'text/html', extension: '.html' },
  'css': { mimeType: 'text/css', extension: '.css' },
  'js': { mimeType: 'text/javascript', extension: '.js' },
  'json': { mimeType: 'application/json', extension: '.json' },
  'xml': { mimeType: 'application/xml', extension: '.xml' },
  
  // Default - treat as text
  'default': { mimeType: 'text/plain', extension: '.txt' }
};

/**
 * Determines file type and extension from a filename
 */
function getFileTypeFromName(fileName: string): { fileType: string, extension: string } {
  // Extract extension if present
  const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  let extension = '';
  let fileType = 'default';
  
  if (extensionMatch && extensionMatch[1]) {
    extension = extensionMatch[1].toLowerCase();
    fileType = extension;
    
    // Map common extensions to file types
    if (['doc', 'docx'].includes(extension)) fileType = 'docx';
    if (['xls', 'xlsx'].includes(extension)) fileType = 'xlsx';
    if (['ppt', 'pptx'].includes(extension)) fileType = 'pptx';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) fileType = extension;
  }
  
  return { fileType, extension };
}

/**
 * Creates a file with the given name and content
 */
export async function createFile(fileName: string, content: string = ''): Promise<FileCreationResult> {
  try {
    const { fileType } = getFileTypeFromName(fileName);
    const fileInfo = fileTypeMappings[fileType] || fileTypeMappings.default;
    
    console.log(`Creating file: ${fileName} (Type: ${fileType}, MIME: ${fileInfo.mimeType})`);
    
    // For office documents and special formats, redirect to online editors
    if (fileInfo.template) {
      window.open(fileInfo.template, '_blank');
      
      return {
        success: true,
        message: `I've opened an online editor for your ${fileType.toUpperCase()} file "${fileName}". Due to browser limitations, we're using an online service to create this document.`,
        fileUrl: fileInfo.template
      };
    }
    
    // For standard file types we can handle directly
    // Create a downloadable file
    const blob = new Blob([content], { type: fileInfo.mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return {
      success: true,
      message: `I've created the file "${fileName}" and started the download.`,
      fileUrl: url
    };
  } catch (error) {
    console.error('Error creating file:', error);
    return {
      success: false,
      message: `Failed to create file "${fileName}": ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
