<script setup lang="ts">
import { computed } from 'vue'

import { ROTULOS_PERFIL } from '@/modules/auth/perfis'
import type { UsuarioDeTeste } from '@/modules/auth/types/devLogin'
import type { PerfilUsuario } from '@/modules/auth/types/session'

const props = defineProps<{ usuario: UsuarioDeTeste }>()

const emit = defineEmits<{ entrar: [login: string] }>()

// Only a few profiles get a tint so the eye can find admins and managers quickly; the rest stay neutral.
const TOM_DO_PERFIL: Partial<Record<PerfilUsuario, string>> = {
  ADMINISTRADOR_GERAL: 'teste-card__tag--alerta',
  ADMINISTRADOR: 'teste-card__tag--alerta',
  GESTOR: 'teste-card__tag--primario',
  PESQUISADOR: 'teste-card__tag--sucesso',
}

const partesDoNome = computed(() => props.usuario.nome.trim().split(/\s+/).filter(Boolean))

const primeiroNome = computed(() => partesDoNome.value[0] ?? props.usuario.login)

const iniciais = computed(() => {
  const partes = partesDoNome.value
  if (partes.length === 0) return '?'
  const primeira = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return (primeira + ultima).toUpperCase()
})

const primeiroLaboratorio = computed(() => props.usuario.laboratorios[0]?.nome ?? null)

const laboratoriosRestantes = computed(() => Math.max(props.usuario.laboratorios.length - 1, 0))
</script>

<template>
  <article class="teste-card">
    <header class="teste-card__header">
      <span class="teste-card__avatar" aria-hidden="true">{{ iniciais }}</span>
      <div class="teste-card__identidade">
        <h3 class="teste-card__nome">{{ usuario.nome }}</h3>
        <p class="teste-card__login">{{ usuario.login }}</p>
      </div>
    </header>

    <ul class="teste-card__tags">
      <li class="teste-card__tag" :class="TOM_DO_PERFIL[usuario.perfil]">{{ ROTULOS_PERFIL[usuario.perfil] }}</li>
      <li v-if="usuario.unidadeSigla" class="teste-card__tag">{{ usuario.unidadeSigla }}</li>
      <li v-if="primeiroLaboratorio" class="teste-card__tag">
        {{ primeiroLaboratorio }}
        <span v-if="laboratoriosRestantes > 0" class="teste-card__mais">+{{ laboratoriosRestantes }}</span>
      </li>
    </ul>

    <button class="teste-card__entrar" type="button" data-test="entrar" @click="emit('entrar', usuario.login)">
      Entrar como {{ primeiroNome }}
    </button>
  </article>
</template>

<style scoped>
.teste-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--sgl-border);
  border-radius: 10px;
  background: var(--sgl-surface);
  transition:
    border-color var(--sgl-transition-fast, 180ms) ease,
    box-shadow var(--sgl-transition-fast, 180ms) ease;
}

.teste-card:hover {
  border-color: rgb(26 77 161 / 35%);
  box-shadow: 0 8px 22px rgb(15 23 42 / 6%);
}

.teste-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.teste-card__avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(26 77 161 / 9%);
  color: var(--sgl-primary);
  font-size: 15px;
  font-weight: 750;
}

.teste-card__identidade {
  min-width: 0;
}

.teste-card__nome {
  margin: 0;
  color: var(--sgl-text);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.teste-card__login {
  margin: 4px 0 0;
  color: var(--sgl-text-muted);
  font-size: 13px;
}

.teste-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.teste-card__tag {
  padding: 5px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
}

.teste-card__tag--alerta {
  background: #fff4e0;
  color: #b45309;
}

.teste-card__tag--primario {
  background: rgb(26 77 161 / 10%);
  color: var(--sgl-primary);
}

.teste-card__tag--sucesso {
  background: #e7f6ec;
  color: #15803d;
}

.teste-card__mais {
  margin-left: 4px;
  color: var(--sgl-text-muted);
}

.teste-card__entrar {
  /* Pushes the button to the card's bottom edge so buttons line up across a row whatever the tag count. */
  margin-top: auto;
  min-height: 46px;
  border: 0;
  border-radius: var(--sgl-radius-control, 6px);
  background: var(--sgl-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--sgl-transition-fast, 180ms) ease;
}

.teste-card__entrar:hover:not(:disabled) {
  background: var(--sgl-primary-dark);
}

.teste-card__entrar:focus-visible {
  outline: 3px solid rgb(45 107 196 / 28%);
  outline-offset: 3px;
}
</style>
