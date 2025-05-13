import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#712ff7]/90 to-[#5e21d6]/80 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-xl"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Logo animation */}
      <div className="relative mb-12 animate-fadeIn">
        <div className="text-7xl font-bold text-white relative">
          <span className="opacity-80">K</span>
          <span className="text-white opacity-90">a</span>
          <span className="text-white opacity-95">m</span>
          <span className="text-white">y</span>
        </div>
        <div className="absolute -bottom-3 left-0 w-full h-1 bg-white/50 rounded-full">
          <div className="h-full w-2/3 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      <div className="z-10 w-full max-w-md space-y-6 animate-slideUp">
        <Link href="/login">
          <button className="w-full bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl py-4 px-6 font-medium transition-all hover:bg-white/20 hover:scale-105 flex items-center justify-center group">
            <span>Entrar com e-mail</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>

        <Link href="/register">
          <button className="w-full bg-white text-[#712ff7] rounded-2xl py-4 px-6 font-medium transition-all hover:bg-opacity-90 hover:scale-105 flex items-center justify-center group">
            <span>Cadastrar</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>

      <div className="absolute bottom-8 text-white/60 text-sm animate-fadeIn delay-500">
        Organize. Colabore. Realize.
      </div>
    </div>
  )
}
