import { Atom } from "lucide-react"

interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function QuantumHubLogo({ className, iconClassName, textClassName }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Atom className={`h-6 w-6 text-primary ${iconClassName || ""}`} />
      <span className={`font-bold ${textClassName || ""}`}>Quantum Hub</span>
    </div>
  )
}
