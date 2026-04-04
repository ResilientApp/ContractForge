import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import cosmicCompass from "../assets/compass.png"

const NotFoundPage = () => {
  return (
    <div className="flex md:flex-row flex-col items-center justify-center min-h-screen h-full [background:linear-gradient(135deg,rgba(139,92,246,0),rgba(6,182,212,0))] bg-cover bg-center">
      <div className="flex flex-col items-start justify-between w-1/2 gap-4 h-full">
        <h1 className="text-5xl font-bold leading-12">Oops! You've Explored <br /> Beyond The Map</h1>

        <div className="flex flex-col items-start justify-center gap-2 !pt-20">
          <p className="text-gray-400">We couldn't find the page you were looking for but</p>
          <p className="font-bold text-center text-2xl italic">"Not all who wander are lost"</p>
          <Link to="/" className="template-button !py-3 !px-8 flex items-center justify-center gap-2 !mt-10">
            <ArrowLeft size={20} />
            <span>Back to Known Paths</span>
          </Link>
        </div>
      </div>

      <div className="hero-visual rotate-12">
        <div className="code-preview">
          <div className="code-header">
            <div className="code-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="code-title">Cosmic Compass</span>
          </div>
          <div className="code-content !p-0">
            <img src={cosmicCompass} alt="Cosmic Compass" className="w-[400px] h-auto object-cover rounded-lg" />
          </div>
      </div>
    </div>
  </div>
)
}

export default NotFoundPage