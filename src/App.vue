<script setup lang="ts">
import '@/modules/admin/styles/cadastros-scale.css'
import AdminCadastrosNavLink from '@/modules/admin/components/AdminCadastrosNavLink.vue'
import EstoqueFiltroEmbalagem from '@/modules/estoque/components/EstoqueFiltroEmbalagem.vue'
import ResiduoPredeterminadoEmBreve from '@/modules/residuos/components/ResiduoPredeterminadoEmBreve.vue'
import ProdutoRotuloAtalho from '@/modules/produtos/components/ProdutoRotuloAtalho.vue'
import SolicitanteThemeToggle from '@/components/SolicitanteThemeToggle.vue'
import UnidadeContextBadge from '@/components/UnidadeContextBadge.vue'
</script>

<template>
  <v-app>
    <router-view />
    <UnidadeContextBadge />
    <SolicitanteThemeToggle />
    <ProdutoRotuloAtalho />
    <AdminCadastrosNavLink />
    <ResiduoPredeterminadoEmBreve />
    <EstoqueFiltroEmbalagem />
  </v-app>
</template>

<style>
.produto-label .label-footer {
  grid-template-columns: 38mm minmax(0, 1fr) 52mm !important;
}

.produto-label .sgl-brand {
  min-width: 52mm !important;
  min-height: 16mm !important;
  align-items: center !important;
  justify-content: center !important;
}

.produto-label .sgl-brand img {
  width: 48mm !important;
  max-width: 48mm !important;
  max-height: 18mm !important;
  margin-inline: auto !important;
  object-fit: contain !important;
  object-position: center !important;
}
</style>
