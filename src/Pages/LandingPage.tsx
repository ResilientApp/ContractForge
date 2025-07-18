"use client"

import type React from "react"
import { useState } from "react"
import { Sparkles, Shield, Zap, ArrowRight, CheckCircle, Rocket, Brain, Lock} from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../components/ui/LandingPage.css"
import resilientdbLogo from "../assets/resilientdb.svg";
import { useNavigate } from "react-router-dom"

type LandingPageProps = {}

const LandingPage: React.FC<LandingPageProps> = () => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const features = [
    {
      icon: <Brain size={24} />,
      title: "AI-Powered Generation",
      description:
        "Leverage DeepSeek's advanced AI to generate sophisticated smart contracts from natural language descriptions.",
    },
    {
      icon: <Shield size={24} />,
      title: "Security First",
      description:
        "Built-in security best practices and vulnerability detection to ensure your contracts are production-ready.",
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Deployment",
      description: "Get deployment-ready Solidity code with comprehensive documentation and gas optimization.",
    },
    {
      icon: <Lock size={24} />,
      title: "ResilientDB Integration",
      description: "Easily deploy to ResilientDB for enhanced security and performance in blockchain applications.",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Describe Your Contract",
      description: "Simply describe what you want your smart contract to do in plain English.",
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our DeepSeek-powered AI analyzes your requirements and generates optimized Solidity code.",
    },
    {
      number: "03",
      title: "Download Files",
      description: "Download the generated Solidity smart contract and JSON configuration files to your device.",
    },
    {
      number: "04",
      title: "Deploy with ResVault",
      description: "Deploy it on ResVault by connecting to ResilientDB mainnet and uploading both the files.",
    },
  ]

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Powered by DeepSeek AI & ResilientDB</span>
            </div>

            <h1 className="hero-title">
              Build Smart Contracts with
              <span className="gradient-text"> AI Precision</span>
            </h1>

            <p className="hero-description">
              Contract Forge revolutionizes smart contract development by combining the power of DeepSeek AI with
              ResilientDB's robust blockchain infrastructure. Generate, optimize, and deploy production-ready smart
              contracts in minutes, not hours.
            </p>

            <div className="hero-actions">
              <button
                className="launch-button"
                onClick={() => navigate("/chatbot")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Rocket size={20} />
                <span>Launch Contract Forge</span>
                <ArrowRight size={16} className={`arrow-icon ${isHovered ? "hovered" : ""}`} />
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="code-preview">
              <div className="code-header">
                <div className="code-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="code-title">Generated Smart Contract</span>
              </div>
              <div className="code-content">
                <pre>{`pragma solidity ^0.8.0;

contract TokenContract {
    string public name = "MyToken";
    mapping(address => uint256) balances;
    
    function transfer(address to, uint256 amount) 
        public returns (bool) {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Contract Forge?</h2>
            <p className="section-description">
              Experience the future of smart contract development with cutting-edge AI technology
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="resvault-section">
            <div className="resvault-card">
              <div className="resvault-content">
                <div className="resvault-icon">
                  <img src={resilientdbLogo} alt="ResVault Logo" width={32} height={32} />
                </div>
                <div className="resvault-text">
                  <h3 className="resvault-title">ResVault Extension</h3>
                  <p className="resvault-description">
                    Deploy your smart contracts seamlessly with ResVault, the official browser extension for
                    ResilientDB. Connect to the mainnet, manage your contracts, and interact with the blockchain
                    directly from your browser.
                  </p>
                </div>
                <div className="resvault-action">
                  <a
                    href="https://chromewebstore.google.com/detail/ejlihnefafcgfajaomeeogdhdhhajamf?utm_source=item-share-cb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resvault-button"
                  >
                    <span>Get ResVault for Chrome</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="steps-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">From idea to deployment in four simple steps</p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Build the Future?</h2>
            <p className="cta-description">
              Join the community of developers who are already using Contract Forge to create secure, efficient smart
              contracts powered by AI.
            </p>

            <div className="cta-features">
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>No coding experience required</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Production-ready contracts</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Built-in security auditing</span>
              </div>
            </div>

            <button className="cta-button" onClick={() => navigate("/chatbot")}>
              <Sparkles size={20} />
              <span>Start Building Now</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
