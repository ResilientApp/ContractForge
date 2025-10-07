import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Coins, Image, Vote, Shield, TrendingUp, ChevronRight, Sparkles } from "lucide-react"
import { getAllTemplates, type ContractTemplate } from "../templates"
import { useNavigate } from 'react-router-dom'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (code: string, templateName: string) => void
}

const categoryIcons: Record<string, any> = {
  token: Coins,
  nft: Image,
  dao: Vote,
  utility: Shield,
  defi: TrendingUp,
}

const difficultyColors: Record<string, string> = {
  beginner: "difficulty-beginner",
  intermediate: "difficulty-intermediate",
  advanced: "difficulty-advanced",
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  // When opened inline, optionally focus the heading for accessibility
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const heading = dialogRef.current.querySelector<HTMLElement>('h2#template-selector-heading')
      heading?.focus()
    }
  }, [isOpen])

  const templates = getAllTemplates()
  const categories = [
    { id: "all", label: "All Templates" },
    { id: "token", label: "Tokens" },
    { id: "nft", label: "NFTs" },
    { id: "dao", label: "DAO" },
    { id: "defi", label: "DeFi" },
    { id: "utility", label: "Utility" },
  ]

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template)
    const defaultParams: Record<string, any> = {}
    template.parameters.forEach((param) => {
      if (param.defaultValue !== undefined) {
        defaultParams[param.name] = param.defaultValue
      }
    })
    setParameters(defaultParams)
    setErrors({})
  }

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters((prev) => ({ ...prev, [paramName]: value }))
    
    // Clear error for this field
    if (errors[paramName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[paramName]
        return newErrors
      })
    }
  }

  const validateField = (param: ContractTemplate['parameters'][number], rawValue: any, acc: Record<string,string>) => {
    const value = rawValue
    const empty = value === undefined || value === "" || value === null
    if (param.required && empty) {
      acc[param.name] = `${param.label} is required`
      return
    }
    if (!param.required && empty) return
    if (param.type === 'number') {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        acc[param.name] = `${param.label} must be a number`
        return
      }
      if (param.validation?.min !== undefined && numValue < param.validation.min) {
        acc[param.name] = `${param.label} must be at least ${param.validation.min}`
      }
      if (param.validation?.max !== undefined && numValue > param.validation.max) {
        acc[param.name] = `${param.label} must be at most ${param.validation.max}`
      }
    }
    if (param.type === 'string' && param.validation?.pattern) {
      const regex = new RegExp(param.validation.pattern)
      if (!regex.test(String(value))) {
        acc[param.name] = `${param.label} format is invalid`
      }
    }
  }

  const validateParameters = (): boolean => {
    if (!selectedTemplate) return false
    const newErrors: Record<string, string> = {}
    selectedTemplate.parameters.forEach(p => validateField(p, parameters[p.name], newErrors))
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = () => {
    if (!selectedTemplate || !validateParameters()) {
      return
    }

    const code = selectedTemplate.generateCode(parameters)
    onSelectTemplate(code, selectedTemplate.name)
    handleClose()
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setParameters({})
    setErrors({})
    setSelectedCategory("all")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="template-selector-overlay inline-mode" ref={dialogRef} aria-labelledby="template-selector-heading" role="region">
      <div className="template-selector-modal">
        <div className="template-selector-header">
          <div className="header-content">
            <button className="back-to-chatbot-btn" onClick={() => { handleClose(); navigate('/chatbot') }} aria-label="Back to Chatbot">←</button>
            <Sparkles className="header-icon" size={24} />
            <div>
              <h2 id="template-selector-heading" tabIndex={-1}>Contract Templates</h2>
              <p>Choose a template and customize it for your needs</p>
            </div>
          </div>
          <button onClick={handleClose} className="close-btn" aria-label="Close template selector">
            <X size={24} />
          </button>
        </div>

        <div className="template-selector-body">
          {!selectedTemplate ? (
            <>
              <div className="category-filter">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="templates-grid">
                {filteredTemplates.map((template) => {
                  const IconComponent = categoryIcons[template.category]
                  return (
                    <div
                      key={template.id}
                      className="template-card"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="template-card-header">
                        <div className="template-icon">
                          <IconComponent size={24} />
                        </div>
                        <span className={`difficulty-badge ${difficultyColors[template.difficulty]}`}>
                          {template.difficulty}
                        </span>
                      </div>
                      <h3>{template.name}</h3>
                      <p>{template.description}</p>
                      <div className="template-tags">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="template-card-footer">
                        <span>Configure</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="template-config">
              <button className="back-btn" onClick={() => setSelectedTemplate(null)}>
                ← Back to Templates
              </button>
              <div className="template-info">
                <div className="template-info-header">
                  {(() => {
                    const IconComponent = categoryIcons[selectedTemplate.category]
                    return <IconComponent size={32} />
                  })()}
                  <div>
                    <h3>{selectedTemplate.name}</h3>
                    <p>{selectedTemplate.description}</p>
                  </div>
                </div>
              </div>
              <div className="parameters-form">
                <h4>Configure Parameters</h4>
                {selectedTemplate.parameters.map((param) => (
                  <div key={param.name} className="form-group">
                    <label>
                      {param.label}
                      {param.required && <span className="required">*</span>}
                    </label>
                    <p className="param-description">{param.description}</p>
                    {param.type === "boolean" ? (
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={parameters[param.name] || false}
                          onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                        />
                      </div>
                    ) : (
                      <input
                        type={param.type === "number" ? "number" : "text"}
                        value={parameters[param.name] || ""}
                        onChange={(e) =>
                          handleParameterChange(
                            param.name,
                            param.type === "number" ? e.target.value : e.target.value
                          )
                        }
                        placeholder={param.placeholder}
                        className={errors[param.name] ? "error" : ""}
                      />
                    )}
                    {errors[param.name] && (
                      <span className="error-message">{errors[param.name]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {selectedTemplate && (
          <div className="template-selector-footer" aria-live="polite">
            <div className="footer-actions">
              <button className="cancel-btn" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </button>
              <button className="generate-btn" onClick={handleGenerate}>
                Generate Contract
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateSelector
