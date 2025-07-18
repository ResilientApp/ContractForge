import type React from "react"
import { Github, ExternalLink, Linkedin, Mail, Heart } from "lucide-react"
import "./ui/Footer.css"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-gradient"></div>
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-title">Contract Forge</h3>
            <p className="footer-subtitle">Empowering smart contract development with AI-driven solutions</p>
          </div>

          {/* Links Section */}
          <div className="footer-links">
            <a
              href="https://github.com/Bismanpal-Singh/ContractForge"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="GitHub Repository"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>

            <a
              href="https://resilientdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="ResilientDB"
            >
              <ExternalLink size={20} />
              <span>ResilientDB</span>
            </a>

            <a href="mailto:bpsanand@ucdavis.edu" className="footer-link" aria-label="Contact Us">
              <Mail size={20} />
              <span>Contact</span>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Contract Forge. Built with <Heart size={14} className="heart-icon" /> at UC Davis.
            </p>
            <p className="footer-powered">
              Powered by <span className="resilient-text">ResilientDB</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
