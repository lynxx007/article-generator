'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import Markdown from 'react-markdown';
import FloatingButton from '@/components/FloatingButton';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp } from "lucide-react"

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, isLoading, data, setData } = useChat()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [article, setArticle] = useState("")
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [streamedData, setStreamedData] = useState<string>("")
  const routes = [
    { path: "/", label: "Generate Article" },
    { path: "/generate-keywords", label: "Generate Keywords" },
  ]

  // New state for managing dropdown open/closed states
  const [isTitleOpen, setIsTitleOpen] = useState(false)
  const [isContentOpen, setIsContentOpen] = useState(false)
  const [isArticleOpen, setIsArticleOpen] = useState(false)

  useEffect(() => {
    if (data) {
      const fullData = data.map((d) => (typeof d === "string" ? d : "")).join("")

      const titleMatch = fullData.match(/\*\*\*~~~~Title~~~\*\*\*\n\n([\s\S]*?)\n\n\*\*\*~~~Content Brief~~~\*\*\*/)
      const contentBriefMatch = fullData.match(
        /\*\*\*~~~Content Brief~~~\*\*\*\n\n([\s\S]*?)\n\n\*\*\*~~~Article~~~\*\*\*/,
      )
      const articleMatch = fullData.match(/\*\*\*~~~Article~~~\*\*\*\n\n([\s\S]*)/)

      if (titleMatch) setTitle(titleMatch[1].trim())
      if (contentBriefMatch) setContent(contentBriefMatch[1].trim())
      if (articleMatch) setArticle(articleMatch[1].trim())

      setStreamedData(fullData)
    }
  }, [data])

  const DropdownSection = ({ title, content, isOpen, setIsOpen } : { title: string; content?: string; isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => (
    <div className={`p-4 rounded-lg shadow-sm border-4 ${isOpen ? "bg-white" : "bg-gray-50"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-bold text-xl text-black"
      >
        {title}
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="mt-2 text-black">
          <Markdown remarkPlugins={[remarkGfm]} className="text-black leading-7">
            {content || `Generating ${title.toLowerCase()}...`}
          </Markdown>
        </div>
      )}
    </div>
  )

  return (
    <div className="font-sans p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-4">
        {title && <DropdownSection title="Title" content={title} isOpen={isTitleOpen} setIsOpen={setIsTitleOpen} />}
        {content && <DropdownSection title="Content Brief" content={content} isOpen={isContentOpen} setIsOpen={setIsContentOpen} />}
        {article && <DropdownSection title="Article" content={article} isOpen={isArticleOpen} setIsOpen={setIsArticleOpen} />}
      </div>

      <form
        onSubmit={(event) => {
          messages.length = 0
          setTitle("")
          setContent("")
          setArticle("")
          setData(undefined)
          handleSubmit(event, {
            experimental_attachments: files,
          })

          setFiles(undefined)

          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }}
        className="mt-6 w-full max-w-2xl space-y-4"
      >
        <input
          type="file"
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files)
            }
          }}
          multiple
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={isLoading}
          className="block w-full p-2 border border-gray-300 bg-white rounded-lg text-black"
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
      <FloatingButton routes={routes} />
    </div>
  )
}