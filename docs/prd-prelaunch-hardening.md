# PRD — Pre-Launch Hardening

**Status:** Aprovado para implementação imediata  
**Objetivo:** Corrigir os bloqueadores críticos de SEO e segurança antes do lançamento público.

---

## Contexto

As fases 1–4 de monetização estão completas. Antes de divulgar o produto, cinco itens críticos precisam ser resolvidos:

1. `/api/process-image` está sem rate limiting — vetor de abuso
2. Homepage não exporta `metadata` (é `"use client"`) — SEO inoperante
3. Página de background removal sem nenhum SEO — 50k buscas/mês perdidas
4. `/pricing` ausente do sitemap
5. Credit packs com nome que colide com o plano "Pro"

---

## Mudanças

---

### 1. Rate Limiting em `/api/process-image`

**Arquivo:** `lib/rate-limit.ts` + `app/api/process-image/route.ts`

**Problema:** Qualquer pessoa (bot, concorrente, script) pode chamar o endpoint ilimitadas vezes, consumindo Sharp/CPU sem autenticação.

**Solução:** Reutilizar o cliente Upstash Redis já configurado. Adicionar um novo `Ratelimit` com sliding window de 20 requisições/hora por IP.

**Regra:**
- Janela: 3600s (1 hora)
- Limite: 20 requisições por IP (hash SHA-256 com salt)
- Resposta em violação: `429` com `{ error: "Too many requests. Please try again later." }`
- Fallback silencioso se Redis estiver indisponível (comportamento padrão do Upstash stub)

**Localização do rate limiter:** `lib/rate-limit.ts` — novo export `processImageLimit`  
**Aplicação:** Top of `POST` handler em `app/api/process-image/route.ts`, antes de qualquer processamento

---

### 2. Homepage SEO — Converter para Server Component

**Arquivos:** `app/page.tsx` (refatorado) + `components/home-page.tsx` (novo)

**Problema:** `app/page.tsx` declara `"use client"` e usa `useState`/`useEffect`, impedindo o export de `metadata`. O Google indexa a página com o título genérico do layout (`ComplyPic — Professional Image Compliance Tool`), que não tem volume de busca.

**Solução:** Extrair toda a lógica de UI para `components/home-page.tsx` (client component). `app/page.tsx` vira server component que exporta metadata e renderiza o client component.

**Novo metadata da homepage:**
```
title: "Free Passport Photo & Compliance Image Tool | ComplyPic"
description: "Resize any photo to exact passport, visa, Amazon, LinkedIn or Instagram specs — correct dimensions, DPI, format and file size. Free. No sign-up required."
```

**OG/Twitter:** Mesmos valores do title/description acima.

---

### 3. SEO da Página de Background Removal

**Arquivo:** `app/tools/background-removal/page.tsx`

**Problema:** A página já é server component mas não exporta `metadata` — sem title tag, sem description, sem OG. O termo "remove background from photo free" tem ~49.500 buscas/mês.

**Solução:**
1. Adicionar `export const metadata: Metadata` com título e descrição focados na busca
2. Adicionar seção textual abaixo do componente `<BackgroundRemover />` com:
   - Parágrafo de contexto (privacidade WASM, zero upload)
   - 3 FAQs (formato `<details>/<summary>` ou componente) para capturar featured snippets

**Novo metadata:**
```
title: "Remove Background from Photo Free — AI Online Tool | ComplyPic"
description: "Remove background from any photo instantly. AI-powered, runs in your browser — your image never leaves your device. Free, no sign-up, works on portraits, products, IDs."
```

**FAQs a adicionar na página:**
- "Is it really free?" → Sim, sem limites, sem conta.
- "Does my photo get uploaded to your servers?" → Não — processa localmente via WASM.
- "What image formats are supported?" → JPEG, PNG, WebP.

---

### 4. Adicionar `/pricing` ao Sitemap

**Arquivo:** `app/sitemap.ts`

**Problema:** A rota `/pricing` não aparece no sitemap, reduzindo a chance de indexação da página de conversão.

**Solução:** Adicionar uma entrada com `priority: 0.9` e `changeFrequency: 'monthly'`.

---

### 5. Renomear Credit Packs

**Arquivo:** `app/pricing/pricing-content.tsx`

**Problema:** O pack "Pro Pack" (600 créditos) colide com o plano "Pro" na página de preços, causando confusão.

**Mapeamento:**
| Antes | Depois |
|---|---|
| Starter | Top-Up 50 |
| Standard | Top-Up 200 |
| Pro Pack | Top-Up 600 |

---

## Ordem de Implementação

1. `lib/rate-limit.ts` — novo export `processImageLimit`
2. `app/api/process-image/route.ts` — aplicar rate limit
3. `components/home-page.tsx` — extrair UI do page atual
4. `app/page.tsx` — converter para server component com metadata
5. `app/tools/background-removal/page.tsx` — metadata + conteúdo SEO
6. `app/sitemap.ts` — adicionar /pricing
7. `app/pricing/pricing-content.tsx` — renomear packs

---

## Critérios de Aceite

- [ ] POST para `/api/process-image` retorna 429 após 20 requisições em 1h no mesmo IP
- [ ] `<title>` da homepage é "Free Passport Photo & Compliance Image Tool | ComplyPic"
- [ ] `<title>` de `/tools/background-removal` existe e contém "Remove Background"
- [ ] `/pricing` aparece no XML do sitemap em `/sitemap.xml`
- [ ] Nenhum pack de crédito se chama "Pro Pack" ou "Starter"
- [ ] Build sem erros TypeScript relevantes
