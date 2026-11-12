# Proteção dos vídeos e materiais da Central de Ajuda

**Data:** 12/11/2026. **Status:** regra de preservação para a auditoria documental.

## Inventário verificado na release

- `src/modules/ajuda/tasks.json`: 20 tutoriais com identificadores `video` estáveis; o FAQ é separado.
- `src/modules/ajuda/helpTasks.ts`: `videoUrl(task)` resolve `/ajuda/videos/${task.video}.mp4` e `posterUrl(task)` resolve `/ajuda/posters/${task.id}.jpg`.
- `src/modules/ajuda/components/HelpTaskContent.vue`: player HTML5 com controles e poster, fallback textual se o vídeo falhar.
- `public/ajuda/posters/`: 20 imagens JPG; `public/ajuda/sgl-guia.pdf` está versionado.
- **Não há arquivos MP4/WebM/MOV na árvore da release consultada**. Os vídeos podem ser disponibilizados por infraestrutura externa ao Git. Isso **não comprova ausência em produção**.
- `src/modules/ajuda/__tests__/helpTasks.spec.ts` verifica a associação de vídeos; `helpAssets.spec.ts` verifica posters e PDF, não os arquivos MP4.

## Regra de preservação obrigatória

1. **Não alterar** vídeos, nomes, identificadores, URLs, posters, ordem de tutoriais, player, scripts de publicação ou arquivos binários como parte da auditoria documental.
2. Não alterar `tasks.json`, `helpTasks.ts`, `HelpTaskContent.vue`, `public/ajuda/` nem testes associados sem solicitação funcional separada e aprovação explícita.
3. Textos em `src/modules/ajuda/textos/` também são publicados ao usuário. Revisar contradições em documento de auditoria antes de propor qualquer correção; se forem editados futuramente, verificar consistência com o vídeo correspondente, sem mexer no vídeo.
4. Se um vídeo não carregar, verificar deploy, rota, hospedagem, tipo MIME, CORS e rede **sem substituir nem apagar o arquivo**.
5. No MR documental, conferir que o diff **não contém** alterações em `public/ajuda/`, `src/modules/ajuda/` ou arquivos de vídeo em qualquer diretório.

## Verificação antes do merge

```bash
git diff --name-status gitlab/release...HEAD -- public/ajuda src/modules/ajuda
git diff --name-status gitlab/release...HEAD -- '*.mp4' '*.webm' '*.mov' '*.jpg' '*.pdf'
```

**Resultado esperado para este trabalho:** nenhuma linha de alteração. A verificação precisa ser repetida contra o GitLab atualizado no momento do MR.
