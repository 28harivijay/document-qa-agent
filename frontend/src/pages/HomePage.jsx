import { useState } from "react"

// Define supported file types and their properties
const fileTypes = [
    { id: "pdf", label: "PDF", ext: ".pdf", accept: ".pdf", placeholder: "Please upload your desired PDF here" },
    { id: "word", label: "Word", ext: ".docx", accept: ".docx", placeholder: "Please upload your Word document here" },
    { id: "excel", label: "Excel", ext: ".xlsx", accept: ".xlsx", placeholder: "Please upload your Excel spreadsheet here" },
]

export default function HomePage({ onUpload }) {
    // Track which file type is selected (pdf, word, or excel)
    const [selected, setSelected] = useState(null)
    // Show loading state while file is being processed
    const [loading, setLoading] = useState(false)

    // Handle file selection and upload to backend
    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            // Send file to backend for processing
            const response = await fetch("https://document-qa-agent-dq1u.onrender.com/upload", {
                method: "POST",
                body: formData
            })
            const data = await response.json()
            
            // Check for errors from backend
            if (data.error) {
                alert(data.error)
                setLoading(false)
                return
            }
            
            // File processed successfully - move to chat page
            onUpload(file, selected)
        } catch (err) {
            alert("Upload failed. Is the backend running?")
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
            {/* Page heading */}
            <h1 className="text-4xl font-medium text-purple-100 text-center mb-3">
                Ask anything from your <span className="text-purple-400">document</span>
            </h1>
            <p className="text-sm text-zinc-600 text-center mb-10">
                Select your file type, upload, and start asking questions
            </p>

            {/* File type selection buttons */}
            <div className="flex gap-4 mb-8">
                {fileTypes.map((ft) => (
                    <button
                        key={ft.id}
                        onClick={() => setSelected(ft)}
                        className={`w-28 py-4 flex flex-col items-center gap-2 rounded-xl border transition-all
              ${selected?.id === ft.id
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-purple-900/40 bg-white/5 hover:bg-purple-500/5 hover:border-purple-500/40"
                            }`}
                    >
                        <span className="text-2xl">{ft.id === "pdf" ? "📄" : ft.id === "word" ? "📝" : "📊"}</span>
                        <span className="text-xs font-medium text-zinc-300">{ft.label}</span>
                        <span className="text-xs text-zinc-600">{ft.ext}</span>
                    </button>
                ))}
            </div>

            {/* Upload zone - shown after file type is selected */}
            {selected && (
                <div className="w-full max-w-md flex flex-col items-center gap-4">
                    {/* Drag & drop / click to upload area */}
                    <div
                        className="w-full border-2 border-dashed border-purple-500/30 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-purple-500/5 hover:border-purple-500/50 transition-all"
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        {/* Upload icon */}
                        <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 stroke-purple-400" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-purple-200 text-center">{selected.placeholder}</p>
                        <p className="text-xs text-zinc-600">Drag and drop or click to browse</p>
                    </div>
                    
                    {/* Hidden file input - triggered by upload zone or button */}
                    <input id="fileInput" type="file" accept={selected.accept} className="hidden" onChange={handleFile} />
                    
                    {/* Upload button */}
                    <button
                        className="w-full bg-purple-600 hover:bg-purple-500 text-purple-100 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-50"
                        onClick={() => document.getElementById("fileInput").click()}
                        disabled={loading}
                    >
                        {loading ? "Processing document..." : "Choose File"}
                    </button>
                </div>
            )}
        </div>
    )
}