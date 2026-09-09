# Etapa 1.4 — aplicação visual nos dashboards

## Escopo

Segundo conjunto da aplicação tela a tela da Etapa 1.

Telas:

- Gestão/Admin: `/dashboard` — `DashboardGestaoView.vue`;
- Solicitante: `/inicio` — `DashboardSolicitanteView.vue`.

O piloto anterior de Pedidos foi aprovado e mergeado. Este conjunto reaplica o mesmo padrão visual sem alterar regras de negócio.

---

## Regras preservadas

- tema claro apenas durante a Etapa 1;
- Dark Mode reservado para a Etapa 2;
- nenhuma alteração em services, chamadas de API ou cálculos dos indicadores;
- nenhuma mudança de rota ou fluxo;
- identidade visual única entre Gestão e Solicitante;
- controles em torno de 40 px;
- títulos de página em 24 px;
- texto operacional mínimo de 12 px;
- cards com raio de 8 px e sombras discretas;
- ícones comuns em torno de 20 px;
- chevrons em 24 px quando indicam navegação;
- cores semânticas: azul ação/informação, verde sucesso, amarelo atenção, vermelho crítico, neutros para estados sem interação.

---

## Gestão / Dashboard

Aplicações principais:

- título e subtítulo trazidos para a escala oficial;
- botão `Atualizar dados` padronizado;
- KPIs com raio, padding, tipografia e sombra do padrão SGL;
- remoção da cor roxa decorativa do KPI de resíduos, aproximando-o da identidade azul institucional;
- cores de atenção e criticidade preservadas apenas onde possuem significado;
- painéis internos com borda e hierarquia padronizadas;
- textos auxiliares elevados para no mínimo 12 px nos pontos alcançados pelo adaptador;
- ícones e chevrons aumentados;
- hover reduzido, evitando cards saltando vários pixels;
- foco de teclado visível;
- estado disabled padronizado;
- `prefers-reduced-motion` respeitado.

### Checklist funcional

- [ ] dashboard carrega normalmente;
- [ ] Atualizar dados continua funcionando;
- [ ] KPI Pedidos abre pedidos pendentes;
- [ ] KPI Urgentes abre pedidos urgentes;
- [ ] KPI Baixo estoque abre estoque filtrado;
- [ ] KPI Resíduos abre pendentes de análise;
- [ ] KPI Vencendo em 30 dias abre lotes;
- [ ] itens de atenção continuam navegando;
- [ ] movimentações continuam abrindo seus contextos;
- [ ] resumo por laboratório continua navegável;
- [ ] painéis continuam responsivos.

### Checklist visual

- [ ] título não está grande demais;
- [ ] KPIs estão legíveis sem parecerem flutuantes;
- [ ] nenhum texto operacional importante parece minúsculo;
- [ ] vermelho só chama atenção em situações críticas;
- [ ] amarelo é usado para atenção;
- [ ] setas de navegação estão palpáveis;
- [ ] hover não provoca salto exagerado dos cards.

---

## Solicitante / Início

Aplicações principais:

- saudação trazida para 24 px;
- contexto do laboratório/unidade mais legível;
- card de data simplificado;
- títulos de seção trazidos para 18 px;
- botão Atualizar em 40 px;
- cards de resumo com escala, raio, padding e sombra padronizados;
- Resíduos ativos deixa de depender de laranja decorativo e passa a utilizar azul institucional;
- cards de acompanhamento padronizados;
- status e linha de progresso tornam textos auxiliares mais legíveis;
- fluxo visual de Resíduos deixa de usar laranja como identidade arbitrária e passa a usar azul institucional;
- ações rápidas recebem chevrons de 24 px;
- hover, focus e estados disabled alinhados ao padrão.

### Checklist funcional

- [ ] `/inicio` carrega normalmente;
- [ ] Atualizar continua funcionando;
- [ ] Pedidos pendentes abre `/meus-pedidos` filtrado;
- [ ] Pedidos aprovados abre `/meus-pedidos` filtrado;
- [ ] Resíduos ativos abre `/meus-residuos`;
- [ ] Pedidos entregues abre `/meus-pedidos` filtrado;
- [ ] pedido mais recente continua abrindo seus detalhes;
- [ ] resíduo mais recente continua abrindo seus detalhes;
- [ ] ações rápidas continuam navegando;
- [ ] responsividade não foi perdida.

### Checklist visual

- [ ] saudação ficou proporcional ao restante do sistema;
- [ ] cards combinam visualmente com Pedidos;
- [ ] textos pequenos estão confortáveis para leitura;
- [ ] progresso continua claro sem excesso de cor;
- [ ] setas das ações rápidas estão grandes o suficiente;
- [ ] nenhuma sombra ficou excessiva.

---

## Validação para merge

Este conjunto só deve ser mergeado após validação visual das duas rotas pelo responsável do projeto.

Próxima tela só deve ser iniciada após aprovação ou registro explícito das pendências encontradas aqui.
