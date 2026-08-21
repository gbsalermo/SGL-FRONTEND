# Estrutura `src`

Scaffold inicial do frontend do SGL. Ainda não contém telas implementadas nem bootstrap do Vue/Vite.

## Organização

```text
src/
├── app/                 # inicialização e composição global
├── assets/              # imagens, ícones e arquivos estáticos importados pelo app
├── components/          # componentes compartilhados
├── layouts/             # shell visual: sidebar, topbar e layouts
├── modules/             # funcionalidades por domínio/responsabilidade
├── router/              # rotas, guards e metadata
├── services/            # cliente HTTP e integrações
├── stores/              # estado global real
├── types/               # tipos TypeScript compartilhados
├── composables/         # lógica reutilizável de composição
├── utils/               # utilitários puros
└── styles/              # CSS global, tokens e base
```

A stack planejada usa TypeScript; por isso não existe uma pasta `js/` separada. Arquivos `.ts` serão adicionados quando o bootstrap técnico começar.
