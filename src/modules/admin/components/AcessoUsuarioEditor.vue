<script setup lang="ts">
import { isAxiosError } from 'axios'
import { computed, ref, watch } from 'vue'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { UsuarioPermissao } from '@/modules/admin/types/cadastros'
import {
  aguardaAprovacao,
  CATEGORIAS,
  PAPEIS_GESTAO,
  papeisConcedidosPor,
  ROTULOS_CATEGORIA,
  ROTULOS_PAPEL,
} from '@/modules/auth/papeis'
import type { CategoriaCargo, PapelSistema } from '@/modules/auth/types/session'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{ usuario: UsuarioPermissao }>()
const emit = defineEmits<{ salvo: [usuario: UsuarioPermissao] }>()

const session = useSessionStore()

const papeis = ref<PapelSistema[]>([])
const categoria = ref<CategoriaCargo | ''>('')
const salvando = ref(false)
const erro = ref('')

watch(() => props.usuario, (usuario) => {
  papeis.value = [...usuario.papeis]
  categoria.value = usuario.categoriaCargo ?? ''
  erro.value = ''
}, { immediate: true })

const concedidos = computed(() => papeisConcedidosPor(session.usuario))
// Roles the actor cannot grant are still shown when the person holds them, but read-only.
const papeisVisiveis = computed(() =>
  PAPEIS_GESTAO.filter((papel) => concedidos.value.includes(papel) || props.usuario.papeis.includes(papel)))

const ehAPropriaPessoa = computed(() => props.usuario.id === session.usuario?.id)
const bloqueado = computed(() => ehAPropriaPessoa.value || aguardaAprovacao(props.usuario))

function mesmosPapeis(a: readonly PapelSistema[], b: readonly PapelSistema[]) {
  return a.length === b.length && a.every((papel) => b.includes(papel))
}

const papeisAlterados = computed(() => !mesmosPapeis(papeis.value, props.usuario.papeis))
const categoriaAlterada = computed(() => Boolean(categoria.value) && categoria.value !== props.usuario.categoriaCargo)
const podeSalvar = computed(() => !bloqueado.value && !salvando.value && (papeisAlterados.value || categoriaAlterada.value))

function alternar(papel: PapelSistema, marcado: boolean) {
  papeis.value = marcado ? [...papeis.value, papel] : papeis.value.filter((item) => item !== papel)
}

function mensagemDeErro(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.data?.codigo === 'ULTIMO_ADMINISTRADOR_LOCAL') {
      return 'A Unidade precisa de pelo menos um administrador local ativo.'
    }
    if (error.response?.data?.codigo === 'ULTIMO_ADMINISTRADOR_GERAL') {
      return 'O sistema precisa de pelo menos um administrador geral ativo.'
    }
    return error.response?.data?.message || 'Não foi possível salvar o acesso.'
  }
  return 'Não foi possível salvar o acesso.'
}

async function salvar() {
  if (!podeSalvar.value) return
  salvando.value = true
  erro.value = ''
  try {
    let atualizado = props.usuario
    if (papeisAlterados.value) {
      atualizado = await cadastrosAdminService.alterarPapeis(props.usuario.id, { papeis: [...papeis.value] })
    }
    if (categoriaAlterada.value && categoria.value) {
      atualizado = await cadastrosAdminService.alterarCategoriaCargo(props.usuario.id, { categoriaCargo: categoria.value })
    }
    emit('salvo', atualizado)
  } catch (error) {
    erro.value = mensagemDeErro(error)
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="acesso-editor">
    <fieldset class="acesso-editor__papeis" :disabled="bloqueado">
      <legend class="sr-only">Papéis de {{ usuario.nome }}</legend>
      <label v-for="papel in papeisVisiveis" :key="papel" class="acesso-editor__papel">
        <input
          type="checkbox"
          :data-test="`papel-${papel}`"
          :checked="papeis.includes(papel)"
          :disabled="!concedidos.includes(papel)"
          @change="alternar(papel, ($event.target as HTMLInputElement).checked)"
        >
        {{ ROTULOS_PAPEL[papel] }}
      </label>
      <span v-if="papeisVisiveis.length === 0" class="acesso-editor__vazio">Sem papel de gestão</span>
    </fieldset>
    <label class="acesso-editor__categoria">
      <span class="sr-only">Categoria de {{ usuario.nome }}</span>
      <select v-model="categoria" data-test="categoria" :disabled="bloqueado">
        <option value="" disabled>Categoria</option>
        <option v-for="item in CATEGORIAS" :key="item" :value="item">{{ ROTULOS_CATEGORIA[item] }}</option>
      </select>
    </label>
    <small v-if="usuario.cargo" class="acesso-editor__cargo" title="Cargo informado pela Embrapa">{{ usuario.cargo }}</small>
    <button
      type="button"
      class="people-outline"
      data-test="salvar-acesso"
      :disabled="!podeSalvar"
      @click="salvar"
    >
      {{ salvando ? 'Salvando...' : 'Salvar acesso' }}
    </button>
    <p v-if="erro" class="acesso-editor__erro" role="alert">{{ erro }}</p>
  </div>
</template>

<style scoped>
.acesso-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.acesso-editor__papeis {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0;
  padding: 0;
  border: 0;
}

.acesso-editor__papel {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.acesso-editor__vazio,
.acesso-editor__cargo {
  color: var(--sgl-text-muted, #64748b);
  font-size: 12px;
}

.acesso-editor__erro {
  flex-basis: 100%;
  margin: 0;
  color: var(--sgl-danger, #b42318);
  font-size: 13px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
