    # SmartOS - Voice & Chat-Based AI Operating System Assistant

    SmartOS is an intelligent voice and chat-based AI assistant that transforms natural language commands into executable system tasks, enabling hands-free, intelligent automation on your operating system.

    ## 🌟 Features
    - **Voice Command Recognition**: Interact with your computer using natural speech
    - **Chat Interface**: Type commands when voice input isn't preferred
    - **Application Management**: Open and control applications with simple commands
    - **File Operations**: Create, delete, and manage files and directories
    - **Content Creation**: Generate content based on specified topics
    - **System Settings**: Toggle system settings like WiFi and Bluetooth
    - **Web Search**: Perform web searches directly from the assistant

    ## 💻 Supported Commands

    SmartOS currently supports the following command types:

    - **OPEN_APP**: Launch applications ("Open Chrome")
    - **WRITE_FILE**: Create and write to files ("Create a text file named notes.txt with...")
    - **CREATE_CONTENT**: Generate content on various topics ("Write an essay about climate change")
    - **TOGGLE_SETTING**: Control system settings ("Turn on Bluetooth")
    - **SEARCH_WEB**: Perform web searches ("Search for pizza recipes")
    - **CREATE_DIRECTORY**: Create new folders ("Create a folder named Projects")
    - **DELETE_FILE**: Remove files from the system ("Delete file.txt")
    - **COPY_FILE**: Copy files between locations ("Copy report.docx to Documents folder")

    ## 🚀 Getting Started

    ### Prerequisites

    - Node.js (v16 or higher)
    - npm or yarn
    - A Google API key for Gemini AI

    ### Installation

    1. Clone the repository:
    ```bash
    git clone https://github.com/Harshanth1/Smart_Os_Assitant.git
    cd Smart_Os_Assitant
    ```

    2. Install dependencies:
    ```bash
    npm install
    # or
    yarn
    ```

    3. Create a `.env` file in the root directory and add your Google API key:
    ```
    API_KEY=your_gemini_api_key_here
    ```

    4. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    5. Open your browser and navigate to `http://localhost:5173`

    ### Building for Production

    ```bash
    npm run build
    # or
    yarn build
    ```

    Then serve the `dist` directory with a static file server.

    ## 🔧 Technical Stack

    - **Frontend**: React with TypeScript
    - **AI**: Google Gemini AI API
    - **Build Tool**: Vite
    - **Speech Recognition**: Web Speech API

    ## 📋 Use Cases

    1. **Productivity Enhancement**
    - Quickly open applications and create files without manual navigation
    - Manage files and folders with voice commands while multitasking

    2. **Accessibility**
    - Provides hands-free computer operation for users with mobility challenges
    - Simplifies computer interaction for non-technical users

    3. **Smart Home Integration**
    - Control system settings that interact with smart home devices
    - Manage digital content for smart displays and systems

    4. **Content Creation**
    - Generate drafts, outlines, and content quickly through voice commands
    - Create and organize files for projects with natural language instructions

    5. **Learning Tool**
    - Helps new computer users understand system operations through natural language
    - Provides a more intuitive interface for interacting with complex systems

    ## 🛣️ Roadmap

    - Expanded application control capabilities
    - Enhanced file management operations
    - Integration with additional AI services
    - User profiles and customized command sets
    - Extended system settings control

    ## 🤝 Contributing

    Contributions are welcome! Please feel free to submit a Pull Request.

    ## 📄 License

    This project is licensed under the MIT License - see the LICENSE file for details.

    ## 🙏 Acknowledgments

    This project was developed with the assistance of AI tools, including GitHub Copilot and other AI programming assistants.

    ---

    Made with ❤️ using AI assistance

