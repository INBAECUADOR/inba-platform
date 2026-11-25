'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function VerificarCertificadoIndexPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const valor = codigo.trim()
    if (!UUID_REGEX.test(valor)) {
      setError('Ingresa el identificador completo del certificado (formato UUID).')
      return
    }
    setError(null)
    router.push(`/verificar-certificado/${valor.toLowerCase()}`)
  }

  return (
    <div className="container-inba section-inba">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Verificación de certificados</h1>
          <p className="text-muted-foreground">
            Comprueba la validez de un certificado emitido por INBA Ecuador. La consulta es pública y no requiere cuenta.
          </p>
        </header>

        <Card>
          <CardContent className="space-y-4 p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="codigo" className="text-sm font-medium text-foreground">
                  Identificador del certificado
                </label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'codigo-error' : undefined}
                />
                {error && (
                  <p id="codigo-error" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Verificar certificado
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              El identificador aparece en el pie del certificado y en la URL de verificación que recibe el titular.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
