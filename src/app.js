import React, { useState, useEffect } from 'react';

// Main App component for the YT-DLP Command Generator
const App = () => {
  // State variables to hold user inputs and generated command
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('best');
  const [outputLocation, setOutputLocation] = useState('~/Downloads/');
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Options for video/audio formats, now including specific resolutions
  const formatOptions = [
    { value: 'best', label: 'Best Quality (Video+Audio)' },
    { value: 'bestvideo+bestaudio', label: 'Best Video + Best Audio (Merged)' },
    { value: 'bestaudio', label: 'Best Audio Only' },
    { value: 'mp4', label: 'MP4 Video' },
    { value: 'mp3', label: 'MP3 Audio' },
    { value: 'webm', label: 'WebM Video' },
    { value: 'mkv', label: 'MKV Video' },
    { value: '2160p', label: '4K (2160p) Video' }, // New quality option
    { value: '1440p', label: '2K (1440p) Video' }, // New quality option
    { value: '1080p', label: 'Full HD (1080p) Video' }, // New quality option
    { value: '720p', label: 'HD (720p) Video' },     // New quality option
    { value: '480p', label: 'SD (480p) Video' },     // New quality option
    { value: '360p', label: 'SD (360p) Video' },     // New quality option
    { value: 'list_formats', label: 'List Available Formats (Run in Terminal)' }, // Option to list formats
  ];

  // Options for common output locations
  const outputLocationOptions = [
    { value: '~/Downloads/', label: 'Downloads Folder (Default)' },
    { value: './', label: 'Current Directory' },
    { value: 'C:\\Users\\YourUser\\Videos\\', label: 'Custom Path (Windows Example)' },
    { value: '/Users/YourUser/Movies/', label: 'Custom Path (macOS/Linux Example)' },
  ];

  // Function to generate the yt-dlp command based on user selections
  const generateYTDLPCommand = () => {
    setShowErrorMessage(false); // Reset error message

    if (!videoUrl.trim()) {
      setGeneratedCommand('');
      setShowErrorMessage(true);
      return;
    }

    let command = 'yt-dlp ';
    let formatString = '';
    let postProcessor = ''; // For audio extraction
    let outputTemplate = ''; // Initialize outputTemplate

    // Handle 'list_formats' as a special case
    if (selectedFormat === 'list_formats') {
      setGeneratedCommand(`yt-dlp -F "${videoUrl.trim()}"`);
      return; // Exit early as other options don't apply
    }

    switch (selectedFormat) {
      case 'best':
        formatString = ''; // yt-dlp defaults to best
        break;
      case 'bestvideo+bestaudio':
        formatString = '-f "bestvideo+bestaudio/best"'; // Explicitly merge best video and audio
        break;
      case 'bestaudio':
        formatString = '-x --audio-format mp3'; // Extract audio and convert to mp3
        postProcessor = ' --embed-thumbnail'; // Embed thumbnail for audio
        break;
      case 'mp4':
        formatString = '-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"';
        break;
      case 'mp3':
        formatString = '-x --audio-format mp3';
        postProcessor = ' --embed-thumbnail';
        break;
      case 'webm':
        formatString = '-f "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best"';
        break;
      case 'mkv':
        formatString = '-f "bestvideo[ext=mkv]+bestaudio[ext=mka]/best[ext=mkv]/best"';
        break;
      case '2160p':
        formatString = '-f "bestvideo[height=2160]+bestaudio/best"'; // 4K
        break;
      case '1440p':
        formatString = '-f "bestvideo[height=1440]+bestaudio/best"'; // 2K
        break;
      case '1080p':
        formatString = '-f "bestvideo[height=1080]+bestaudio/best"'; // Full HD
        break;
      case '720p':
        formatString = '-f "bestvideo[height=720]+bestaudio/best"';   // HD
        break;
      case '480p':
        formatString = '-f "bestvideo[height=480]+bestaudio/best"';   // SD
        break;
      case '360p':
        formatString = '-f "bestvideo[height=360]+bestaudio/best"';   // SD
        break;
      default:
        formatString = ''; // Fallback to best
    }

    // Add format string
    if (formatString) {
      command += formatString + ' ';
    }

    // Add output template and location
    // Only add output template if not listing formats
    if (selectedFormat !== 'list_formats') {
      outputTemplate = ` -o "${outputLocation}%(title)s.%(ext)s"`;
      command += outputTemplate;
    }

    // Add post-processor if applicable
    if (postProcessor) {
      command += postProcessor;
    }

    // Add the video URL at the end
    command += ` "${videoUrl.trim()}"`;

    setGeneratedCommand(command);
  };

  // Effect to regenerate command whenever inputs change
  useEffect(() => {
    generateYTDLPCommand();
  }, [videoUrl, selectedFormat, outputLocation]);

  // Function to copy the generated command to clipboard
  const copyCommandToClipboard = () => {
    if (generatedCommand) {
      // Using document.execCommand for broader compatibility in iframes
      const textarea = document.createElement('textarea');
      textarea.value = generatedCommand;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      setShowCopiedMessage(true);
      const timer = setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000); // Message disappears after 2 seconds
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-blue-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
          <span className="text-blue-600">YT-DLP</span> Command Generator
        </h1>

        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
          Generate `yt-dlp` commands for your terminal.
          <br />
          <span className="font-semibold text-red-600">Requires `yt-dlp` and `FFmpeg` installed locally.</span>
        </p>

        {/* Video URL Input */}
        <div className="mb-6">
          <label htmlFor="videoUrl" className="block text-gray-700 text-sm font-bold mb-2">
            YouTube Video URL:
          </label>
          <input
            type="url"
            id="videoUrl"
            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          {showErrorMessage && (
            <p className="text-red-500 text-xs italic mt-2">Please enter a valid YouTube URL.</p>
          )}
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label htmlFor="format" className="block text-gray-700 text-sm font-bold mb-2">
            Download Format:
          </label>
          <div className="relative">
            <select
              id="format"
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Output Location (Hidden if 'List Available Formats' is selected) */}
        {selectedFormat !== 'list_formats' && (
          <div className="mb-8">
            <label htmlFor="outputLocation" className="block text-gray-700 text-sm font-bold mb-2">
              Output Location:
            </label>
            <div className="relative">
              <select
                id="outputLocation"
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={outputLocation}
                onChange={(e) => setOutputLocation(e.target.value)}
              >
                {outputLocationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-xs italic mt-2">
              Ensure this path exists on your system. Use forward slashes for all OS.
            </p>
          </div>
        )}


        {/* Generated Command Display */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 relative">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Generated Command:
          </label>
          <pre className="whitespace-pre-wrap break-all text-sm font-mono text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200 overflow-x-auto">
            {generatedCommand || 'Enter a URL to generate command...'}
          </pre>
          <button
            onClick={copyCommandToClipboard}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            disabled={!generatedCommand}
          >
            {showCopiedMessage ? 'Copied!' : 'Copy Command'}
          </button>
        </div>

        <p className="text-gray-600 text-center text-xs sm:text-sm">
          Copy the command above and paste it into your terminal (PowerShell, CMD, Bash, Zsh, etc.)
          to start the download.
        </p>
      </div>
    </div>
  );
};

export default App;