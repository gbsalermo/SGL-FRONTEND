<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VinculosUsuariosCadastro from '@/modules/admin/components/VinculosUsuariosCadastro.vue'
import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { UsuarioPermissao, LaboratorioCadastro, ProjetoCadastro } from '@/modules/admin/types/cadastros'
const usuarios = ref<UsuarioPermissao[]>([])
const laboratorios = ref<LaboratorioCadastro[]>([])
const projetos = ref<ProjetoCadastro[]>([])
const erro = ref('')
const carregando = ref(false)
async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [u, l, p] = await Promise.all([
      cadastrosAdminService.listarUsuarios(),
      cadastrosAdminService.listarLaboratorios(),
      cadastrosAdminService.listarProjetos(),
    ])
    usuarios.value = u
    laboratorios.value = l
    projetos.value = p
  } catch(e) {
    erro.value = e instanceof Error ? e.message : 'Falha ao carregar cadastros.'
  } finally { carregando.value = false }
}
onMounted(carregar)
</script>
<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ADMINISTRAÇÃO / CADASTROS</p>
        <h1>Vínculos operacionais</h1>
        <span>Gerencie o laboratório-base e as associações de usuários de teste.</span>
      </div>
      <button class="btn btn--ghost" type="button" :disabled="carregando" @click="carregar">Atualizar</button>
    </header>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-if="carregando">Carregando...</p>
    <VinculosUsuariosCadastro v-else :usuarios="usuarios" :laboratorios="laboratorios" :projetos="projetos" />
  </section>
</template>
