'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import Markdown from 'react-markdown';
import FloatingButton from '@/components/FloatingButton';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, isLoading, data, setData } = useChat({
    api: '/api/generate-keywords',
  });
  const [files, setFiles] = useState<FileList | undefined>(undefined);
//   const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamedData, setStreamedData] = useState<string>('');
  const routes = [
    { path: "/", label: "Generate Article" },
    { path: "/generate-keywords", label: "Generate Keywords" },
  ];


//   useEffect(() => {
//     if (data) {
//       messages[messages.length - 1].content = data.map(d => d).join('');
//       setStreamedData(data.map(d => d).join(''));
//     }
//   }, [data]);

  return (
    <div className="font-sans p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`p-4 rounded-lg shadow-md ${message.role === 'user' ? 'bg-blue-100' : 'bg-white'}`}>
            <div className="font-bold mb-2 text-black">{`${message.role}: `}</div>
            <div className="mb-2 text-black">
              <Markdown className='text-black'>{message.content}</Markdown>
            </div>
            {/* <div className="space-y-2">
              {message.experimental_attachments
                ?.filter(attachment => attachment.contentType?.startsWith('image/'))
                .map((attachment, index) => (
                  <img
                    key={`${message.id}-${index}`}
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full rounded-lg"
                  />
                ))}
            </div> */}
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          messages.length = 0
          setData(undefined)
          handleSubmit(event, {
            experimental_attachments: files,
          });
        }}
        className="mt-6 w-full max-w-2xl space-y-4"
      >
        {/* <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        /> */}
        <input
          value={input}
          placeholder="Enter instagram username"
          onChange={handleInputChange}
          disabled={isLoading}
          className="block w-full p-2 border border-gray-300 bg-white rounded-lg text-black"
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      <FloatingButton routes={routes} />
    </div>
  );
}