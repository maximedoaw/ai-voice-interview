"use client"

import { useState } from "react"
import { createInterview } from "@/actions/interview.action"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Question } from "@/types/interview"
import { ArrowLeft, Trash2, Plus, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const ROLES = [
  "Développeur Frontend (React/Next)",
  "Développeur Backend (Node/Python)",
  "Fullstack Engineer",
  "Product Manager",
  "UX/UI Designer",
  "Data Scientist",
  "DevOps / SRE",
  "Autre (préciser)"
]

export default function NewInterviewPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [role, setRole] = useState("")
  const [customRole, setCustomRole] = useState("")
  const [level, setLevel] = useState<"junior" | "mid" | "senior">("mid")
  
  // Custom questions state
  const [customQuestions, setCustomQuestions] = useState<{text: string, category: string}[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [previewReady, setPreviewReady] = useState(false)

  const handleAddQuestion = () => {
    setCustomQuestions([...customQuestions, { text: "", category: "Général" }])
  }

  const handleRemoveQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, field: "text" | "category", value: string) => {
    const newQuestions = [...customQuestions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setCustomQuestions(newQuestions)
  }

  const buildQuestionsFromPreview = () => {
    if (isCustomMode) {
      const validQuestions = customQuestions.filter((q) => q.text.trim() !== "")
      if (validQuestions.length === 0) {
        toast.error("Veuillez entrer au moins une question valide.")
        return null
      }

      return validQuestions.map((q) => ({
        id: crypto.randomUUID(),
        text: q.text.trim(),
        category: q.category.trim() || "Général",
      }))
    }

    return generatedQuestions.length > 0 ? generatedQuestions : null
  }

  const handlePreviewQuestions = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return

    const finalRole = role === "Autre (préciser)" ? customRole : role
    if (!finalRole) {
      toast.error("Veuillez choisir un poste visé.")
      return
    }

    try {
      setIsLoading(true)

      if (isCustomMode) {
        const questions = buildQuestionsFromPreview()
        if (!questions) return
        setGeneratedQuestions(questions)
        setPreviewReady(true)
        toast.success("Aperçu des questions prêt.")
        return
      }

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate-questions",
          role: finalRole,
          level,
          count: questionCount,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Impossible de générer les questions à partir de l'IA.")
      }

      const questionsFromApi = Array.isArray(data?.questions) ? data.questions : []
      if (questionsFromApi.length === 0) {
        throw new Error("Le modèle n'a pas retourné de questions valides.")
      }

      const questions = questionsFromApi.map((q: any) => ({
        id: crypto.randomUUID(),
        text: String(q.text || "").trim(),
        category: String(q.category || "Général").trim() || "Général",
      }))

      setGeneratedQuestions(questions)
      setPreviewReady(true)
      toast.success("Aperçu des questions prêt.")
    } catch (error: any) {
      console.error(error)
      toast.error("Impossible de générer l'aperçu", { description: error.message || "Une erreur est survenue." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInterview = async () => {
    if (!user) return

    const finalRole = role === "Autre (préciser)" ? customRole : role
    if (!finalRole) {
      toast.error("Veuillez choisir un poste visé.")
      return
    }

    const questionsToSave = buildQuestionsFromPreview()
    if (!questionsToSave) return

    try {
      setIsLoading(true)
      const interviewId = await createInterview({
        userId: user.uid,
        role: finalRole,
        level,
        questions: questionsToSave,
      })

      toast.success("Simulation créée avec succès !")
      router.push(`/interview/${interviewId}`)
    } catch (error: any) {
      console.error(error)
      toast.error("Impossible de créer l'entretien", { description: error.message || "Une erreur est survenue." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 container mx-auto px-6 py-12 max-w-2xl mt-4">
      <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium gap-2 mb-8">
         <ArrowLeft size={16} />
         Tableau de bord
      </Link>

      <div className="bg-[var(--bg-page)] p-8 md:p-12 rounded-xl border border-[var(--border-default)] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Nouvelle Simulation</h1>
          <p className="text-[var(--text-secondary)] mb-10 text-base">Configurez votre environnement d'entretien IA et préparez-vous à échanger vocalement.</p>

          <form onSubmit={handlePreviewQuestions} className="space-y-8">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Poste visé</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                      role === r 
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)] border-[var(--border-strong)]" 
                        : "bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === "Autre (préciser)" && (
                <input 
                  type="text"
                  placeholder="Ex: Architecte Cloud AWS"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors text-base"
                  required
                />
              )}
            </div>

            {/* Level Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Séniorité actuelle</label>
              <div className="flex gap-3">
                {(["junior", "mid", "senior"] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors uppercase tracking-wider ${
                      level === l 
                        ? "bg-[var(--bg-active)] text-[var(--text-primary)] border-[var(--border-strong)]" 
                        : "bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions generation section */}
            <div className="space-y-4 pt-6 border-t border-[var(--border-default)]">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Questions de l'entretien</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(!isCustomMode)
                    if (!isCustomMode && customQuestions.length === 0) {
                      handleAddQuestion()
                    }
                  }}
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
                >
                  {isCustomMode ? "Désactiver le mode personnalisé" : "Personnaliser les questions"}
                </button>
              </div>

              {!isCustomMode ? (
                <div className="space-y-3">
                  <div className="bg-[var(--bg-sidebar)] rounded-lg p-4 border border-[var(--border-default)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                      L'IA générera des questions adaptées au poste et au niveau choisi.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-4">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Nombre de questions à générer
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-[var(--bg-page)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    >
                      {[3, 4, 5, 6, 7, 8].map((value) => (
                        <option key={value} value={value}>{value} questions</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {customQuestions.map((q, index) => (
                    <div key={index} className="flex gap-3 items-start bg-[var(--bg-page)] p-4 rounded-lg border border-[var(--border-default)] shadow-xs relative group">
                      <div className="flex-1 space-y-3">
                        <textarea
                          placeholder="Entrez votre question..."
                          value={q.text}
                          onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                          className="w-full bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                          rows={2}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Catégorie (ex: Technique, Soft skills)"
                          value={q.category}
                          onChange={(e) => handleQuestionChange(index, "category", e.target.value)}
                          className="w-full bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-[var(--text-disabled)] hover:text-[var(--danger)] p-2 transition-colors"
                        title="Supprimer la question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-3 rounded-lg border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] font-medium text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Ajouter une question
                  </button>
                </div>
              )}
            </div>

            {previewReady && generatedQuestions.length > 0 && (
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Aperçu des questions</p>
                    <p className="text-sm text-[var(--text-secondary)]">Vérifie la liste avant de lancer l’entretien.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedQuestions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xs font-semibold text-[var(--accent)]">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{question.text}</p>
                          <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-secondary)]">{question.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <button 
                type="submit"
                disabled={isLoading || !role || (role === "Autre (préciser)" && !customRole) || (isCustomMode && customQuestions.length === 0)}
                className="w-full bg-[var(--accent)] text-white py-3.5 rounded-lg font-medium text-base hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? "Préparation..." : previewReady ? "Rafraîchir l'aperçu" : "Prévisualiser les questions"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {previewReady && generatedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleCreateInterview}
                  disabled={isLoading}
                  className="w-full border border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] py-3.5 rounded-lg font-medium text-base hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Création en cours..." : "Créer l'entretien"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
