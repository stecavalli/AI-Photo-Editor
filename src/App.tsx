import React, { useState, useCallback } from 'react';
import { Status } from './types';
import type { EditResult } from './types';
import { editImage } from './services/geminiService';
import { ImageUpload } from './components/ImageUpload';
import { Spinner } from './components/Spinner';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setOriginalImage(result);
        setEditedImage(null);
        setError(null);
        setStatus(Status.Idle);
        setResponseText(null);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the selected file.');
        setStatus(Status.Error);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setStatus(Status.Processing);
    setError(null);
    setEditedImage(null);
    setResponseText(null);

    try {
      const result: EditResult = await editImage(originalImage, prompt);
      setEditedImage(result.image);
      setResponseText(result.text);
      setStatus(Status.Success);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setStatus(Status.Error);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setStatus(Status.Idle);
    setError(null);
    setResponseText(null);
  };

  const isProcessing = status === Status.Processing;

  const renderResultArea = () => {
    switch (status) {
      case Status.Processing:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-800/50 rounded-lg">
            <Spinner />
            <p className="text-indigo-300 font-medium animate-pulse">AI is working its magic...</p>
          </div>
        );
      case Status.Success:
        if (editedImage) {
          return (
            <div className="flex flex-col gap-4 items-center h-full">
              <img src={editedImage} alt="Edited result" className="object-contain max-h-[80%] rounded-lg shadow-2xl" />
              {responseText && <p className="text-center text-sm bg-gray-800 p-3 rounded-lg border border-gray-700">{responseText}</p>}
            </div>
          );
        }
        return null;
      case Status.Error:
        return (
           <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center bg-red-900/20 border border-red-500/50 rounded-lg p-4">
             <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-12 h-12 text-red-400" />
            <p className="font-semibold text-red-300">An Error Occurred</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        );
      case Status.Idle:
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-4">
            <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-16 h-16 text-gray-500"/>
            <p className="text-gray-400">Your edited photo will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
          AI Photo Editor
        </h1>
        <p className="mt-2 text-lg text-gray-400">Edit photos with the power of Nano Banana AI</p>
      </header>

      <main className="w-full max-w-7xl flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls & Original Image */}
        <div className="flex flex-col gap-6 bg-gray-800/40 p-6 rounded-xl border border-gray-700">
          <div className="flex-grow flex flex-col items-center justify-center">
            {originalImage ? (
                <div className="w-full flex flex-col items-center gap-4">
                    <img src={originalImage} alt="Original upload" className="max-h-96 w-auto object-contain rounded-lg shadow-lg" />
                    <button onClick={handleReset} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                        Use a different photo
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg text-center">
                    <Icon path="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" className="w-20 h-20 text-gray-500"/>
                    <h3 className="text-xl font-semibold">Upload Your Photo</h3>
                    <p className="text-gray-400">Select a PNG, JPG, or WEBP file to start editing.</p>
                     <div className="mt-4 w-full max-w-xs">
                        <ImageUpload onImageSelect={handleImageSelect} />
                    </div>
                </div>
            )}
          </div>
            
          {originalImage && (
             <div className="w-full flex flex-col gap-4">
                <label htmlFor="prompt" className="font-semibold text-lg">2. Describe your edit</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'add a birthday hat on the cat', 'change the background to a snowy mountain'"
                    className="w-full h-28 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={isProcessing}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !prompt}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
                >
                  {isProcessing ? <>
                    <Spinner />
                    <span>Generating...</span>
                  </> : <>
                    <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.312-2.312L12 17.25l1.197-.398a3.375 3.375 0 002.312-2.312L16.5 12.75l.398 1.197a3.375 3.375 0 002.312 2.312L20.25 18l-1.197.398a3.375 3.375 0 00-2.312 2.312z" className="w-6 h-6"/>
                    <span>Generate Edit</span>
                  </>}
                </button>
            </div>
          )}

        </div>

        <div className="flex flex-col bg-gray-800/40 p-6 rounded-xl border border-gray-700 min-h-[400px] lg:min-h-0">
          {renderResultArea()}
        </div>
      </main>
    </div>
  );
};

export default App;
