'use client'

import { generateIntro } from "@/lib/generateIntro";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isSlideUp, setIsSlideUp] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [introduction, setIntroduction] = useState<string>("");

  const handleSubmit = () => {
    let buffer = '';
    generateIntro(inputValue).then((stream) => {
      const reader = stream.getReader();
      
      function readChunk() {
        reader.read().then(({ done, value }) => {
          if (!done) {
            buffer += value;
            
            // Check for complete title tag
            const titleMatch = buffer.match(/<title>(.*?)<\/title>/);
            if (titleMatch) {
              setTitle(titleMatch[1]);
              setIsSlideUp(true);
              buffer = "";
            }

            const imageMatch = buffer.match(/<image description="([^"]+)" \/>/);
            if (imageMatch) {
              setImages(prevImages => [...prevImages, imageMatch[1]]);
              buffer = buffer.replace(imageMatch[0], '');
            }

            const conceptMatch = buffer.match(/<concept name="([^"]+)" animation="([^"]+)" \/>/);
            if (conceptMatch) {
              setConcepts(prevConcepts => [...prevConcepts, conceptMatch[1]]);
              buffer = buffer.replace(conceptMatch[0], '');
            }

            const introductionMatch = buffer.match(/<introduction>(.*?)<\/introduction>/);
            if (introductionMatch) {
              setIntroduction(introductionMatch[1]);
              buffer = buffer.replace(introductionMatch[0], '');
            }
            
            console.log(value);
            readChunk();
          }
        });
      }

      readChunk();
    });
  };

  return (
    <>
      <div className={`min-h-screen transition-transform duration-1000 ${isSlideUp ? '-translate-y-full' : ''}`}>
        {/* Floating header */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-black/80 h-16 flex items-center px-8">
          <a href="https://dewy.info" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 dark:hover:text-gray-300 transition-all transform hover:translate-y-[-2px]"><h2 className="text-xl font-semibold">Instructor <span className="text-sm text-gray-500">by dewy</span></h2></a>
          <div className="flex items-center gap-4 ml-auto">
            <button className="text-gray-600 dark:text-gray-400 transition-all transform hover:translate-y-[-2px] hover:text-gray-800 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"></svg>
            </button>
            <a
              href="https://github.com/Ephibbs/dewy-instruct"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-4xl font-bold mb-8">What do you want to learn?</h1>
          
          <div className="relative w-full max-w-xl">
            <input 
              type="text"
              placeholder="Type your learning goal..."
              className="w-full px-6 py-4 text-lg rounded-full border border-gray-200 dark:border-gray-800 focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
              aria-label="Search"
              onClick={handleSubmit}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14m-7-7l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </main>
      </div>
      <div className={`fixed inset-0 flex items-center justify-center transition-all duration-1000 ${isSlideUp ? '' : 'translate-y-full'}`}>
        {/* <div className={`absolute top-8 left-8 transition-all duration-500 delay-1000 ${isSlideUp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={() => setIsSlideUp(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            End Lesson
          </button>
        </div> */}

        <h1 className="text-5xl font-bold">{title}</h1>

        <div className={`absolute right-4 top-8 bottom-8 w-1 bg-gray-200 dark:bg-gray-800 rounded-full transition-all duration-500 delay-1000 ${isSlideUp ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-[0%] bg-red-500 rounded-full"></div>
        </div>

        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 delay-1000 ${isSlideUp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 flex items-center justify-center bg-transparent hover:bg-gray-200 ${!isPlaying ? 'text-gray-600' : 'text-red-500'} rounded-full text-gray-600 transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox={`${isPlaying ? "0 0 24 24" : "-2 0 24 24"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isPlaying ? (
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
              ) : (
                <path d="M5 3l14 9-14 9V3z"/>
              )}
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
