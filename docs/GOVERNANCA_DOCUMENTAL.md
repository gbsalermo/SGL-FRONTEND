# Governança documental — SGL Frontend

**Estado:** organização e resolução de redundância de autoridade em 12/11/2026. **Não** equivale à validação funcional integral. Base: arquivos e roteador da `release`; branch de trabalho `collab/docs-release-estado-2026-11`.

## Regra de precedência

1. **Comportamento executável:** código, contratos, testes e migrations da `release`; divergências documentais exigem investigação, não correção silenciosa do código.
2. **Decisões de produto vigentes:** regras expressamente ratificadas no dossiê/contratos atualizados; uma decisão histórica não prevalece sobre implementação posterior sem confirmação.
3. **Documentos canônicos por responsabilidade** (abaixo). Cada informação tem um proprietário documental; os demais documentos apontam para ele.
4. **Histórico:** arquivos de etapas, auditorias datadas e checkpoints anteriores permanecem preservados para rastreabilidade, sem caráter de instrução vigente.
5. **Ajuda pública:** `src/modules/ajuda/textos/*.md` é material publicado e deve corresponder à implementação; seus vídeos, posters e vínculos são intocáveis nesta auditoria.

## Mapa de responsabilidade sem duplicação

| Tema | Fonte proprietária | Documentos relacionados e política |
|---|---|---|
| Estado atual, pendências, próxima decisão | `../CONTINUIDADE.md` | Dossiê aponta para checkpoint; não manter segundo roadmap vigente |
| Onde mexer, dependências, testes | `DOSSIE_PROJETO_SGL.md` | `ESTRUTURA_FRONTEND.md` documenta convenções, sem duplicar mapa por arquivo |
| Estrutura e organização de módulos | `ESTRUTURA_FRONTEND.md` | `FLUXOS_NAVEGACAO.md` descreve jornada; `INVENTARIO_TELAS.md` é fotografia datada, não lista oficial de rotas |
| Rotas efetivas | `src/router/index.ts` | Inventário e dossiê remetem ao roteador; não copiar tabela extensa de rotas para vários arquivos |
| Identidade visual e componentes | `PADRAO_VISUAL_PRE_PRODUCAO.md` | `IDENTIDADE_VISUAL.md` registra identidade; `PADROES_PAGINA.md` composições; `SHELL_VISUAL.md` shell; `REGRA_PADRONIZACAO_NOVOS_MODULOS.md` checklist |
| Conceitos visuais antigos | `ICONOGRAFIA.md`, `SIDEBAR_ALERTAS.md`, `GUIA_EFEITOS_VISUAIS.md` | Referências conceituais, não regras que substituem padrão atual |
| Fluxos de pedidos/estagiários | Código e contratos de domínio da `release` | `ETAPA_8_*.md` preservam decisões e validações de época; divergências na Ajuda vão para auditoria |
| Rótulos e Zebra | Código da `release` e `ETAPA_10_*.md` como decisões datadas | `ROTULO_PRODUTOS.md` e `ROTULO_RESIDUOS.md` são descrição especializada sujeita à versão mais recente |
| GitLab/GitHub | `SINCRONIZACAO_GITLAB_GITHUB.md` | Nenhum outro documento define `main` como destino atual de MR; `release` é base |
| Índice e navegação documental | `docs/README.md` | Somente índice; atualização editorial completa **depois** da validação dos contratos |
| Histórico de etapas e auditorias | Arquivos `ETAPA_*`, `AUDITORIA_*`, `CONTINUIDADE_ETAPA_*`, `FECHAMENTO_*` | Preservar nome e conteúdo; não usar como instrução sem data/contexto |
| Tutoriais publicados | `src/modules/ajuda/textos/*.md` | Revisar coerência sem tocar em `tasks.json`, vídeos, posters, player ou PDF; ver `PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md` |

## Redundâncias resolvidas na organização

- **Roadmap em três lugares:** checkpoint vigente só em `CONTINUIDADE.md`; `ROADMAP_INTERFACE_GESTAO.md` é histórico; dossiê não redefine cronograma.
- **Regras visuais repetidas:** tokens/dimensões pertencem ao padrão visual; identidade, shell e páginas têm escopos distintos. Conflitos concretos de CSS ainda requerem validação.
- **Lista de rotas repetida:** `src/router/index.ts` é fonte verificável; documentos oferecem navegação e referências, não contratos paralelos.
- **Regras Git conflitantes:** atualização de novembro no documento de sincronização prevalece sobre texto antigo de setembro, mantido para auditoria.
- **Etapas concluídas descritas como futuras:** checkpoints datados são históricos e não comandam a próxima implementação.
- **Ajuda versus regras de pedidos:** divergência **não resolvida funcionalmente**; ver `AUDITORIA_DOCUMENTAL_FRONTEND_2026-11-12.md`. Não editar tutoriais ou vídeos sem validação.

## Política de manutenção

Ao alterar uma funcionalidade, atualizar primeiro código/testes, depois o documento proprietário do assunto e por fim links de entrada. Não duplicar regra textual em vários arquivos. Se for decisão histórica, preservar data, branch, evidência e status. Não remover documentos para “reduzir redundância”: resolver a autoridade e, após aprovação, arquivar apenas se houver benefício concreto.

## Limites e aceite

**Organização e propriedade editorial definidas; validação de conteúdo pendente.** A auditoria de contratos, links, regras, testes e produção segue aberta. Não realizar merge nem declarar homologação integral com base neste documento.
