// components/top-bar.tsx
import { BackButton } from "@/components/back-button";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Cabeçalho padrão das subpáginas: seta de voltar (esquerda), título/subtítulo (centro) e
 * alternador de tema (direita). `onBack` sobrescreve o padrão router.back() — útil para
 * voltar um passo dentro de um wizard em vez de sair da página. `hideBack` tira a seta
 * (usado só na própria /dashboard, que não tem "página anterior" dentro do app).
 */
export function TopBar({
  title,
  subtitle,
  onBack,
  hideBack = false,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hideBack?: boolean;
}) {
  return (
    <header className="flex items-center gap-2">
      {!hideBack && <BackButton onClick={onBack} />}
      <div className="min-w-0 flex-1">
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
        <h1 className="truncate text-lg font-semibold">{title}</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
