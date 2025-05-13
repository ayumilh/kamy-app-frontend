"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/home"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#712ff7] to-transparent rounded-b-[40px]" />

      <div className="z-10 w-full max-w-md">
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="rounded-full p-2 bg-white/20 backdrop-blur-md hover:bg-white/30">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </Link>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/50">
          <h1 className="text-3xl font-bold text-[#712ff7] mb-6">Criar conta</h1>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 py-6 rounded-xl border-gray-200 focus:border-[#712ff7] focus:ring-[#712ff7] transition-all bg-white/50"
                  placeholder="Seu nome"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-6 rounded-xl border-gray-200 focus:border-[#712ff7] focus:ring-[#712ff7] transition-all bg-white/50"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 rounded-xl border-gray-200 focus:border-[#712ff7] focus:ring-[#712ff7] transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#712ff7] hover:bg-[#5e21d6] text-white py-6 rounded-xl font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Cadastrando...</span>
                </div>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-[#712ff7] hover:text-[#5e21d6] font-medium transition-colors">
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
