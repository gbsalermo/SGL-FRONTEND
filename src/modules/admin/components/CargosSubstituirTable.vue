<script setup lang="ts">
// Lista "Cargos a substituir": cadastros da unidade cujo ocupante não pode mais exercer o cargo
// (saiu da Embrapa, mudou de lotação etc.). Cada linha leva à tela que já edita aquele cadastro.
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

import { cadastrosAdminService } from '@/modules/admin/services/cadastrosAdminService'
import type { CargoSubstituicao, TipoCargoSubstituicao } from '@/modules/admin/types/cadastros'
import type { PerfilUsuario } from '@/modules/auth/types/session'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()
const cargos = ref<CargoSubstituicao[]>([])
const carregando = ref(false)
const erro = ref('')

const rotulosTipo: Record<TipoCargoSubstituicao, string> = {
  RESPONSAVEL_LABORATORIO: 'Responsável de laboratório',
  ORIENTADOR_ESTAGIO: 'Orientador de estágio',
  GESTOR_RECEBEDOR_RESIDUO: 'Gestor recebedor de resíduo',
}

// Para onde ir editar cada tipo: laboratório na aba Laboratórios dos cadastros, vínculo de
// estágio na tela de estagiários e resíduo na tela de resíduos.
function destino(cargo: CargoSubstituicao): RouteLocationRaw {
  if (cargo.tipo === 'RESPONSAVEL_LABORATORIO') {
    return { path: '/administracao/cadastros', query: { secao: 'laboratorios', busca: cargo.descricao.replace(/^Responsável pelo laboratório /, '') } }
  }
  if (cargo.tipo === 'ORIENTADOR_ESTAGIO') return { path: '/estagiarios' }
  return { path: '/residuos' }
}

// Só mostra o link se o perfil de quem vê pode abrir a rota (meta.perfis do router, a regra
// mais específica vence, como no guard). Caso contrário a linha mostra só o texto.
function destinoPermitido(cargo: CargoSubstituicao): RouteLocationRaw | null {
  const alvo = destino(cargo)
  const perfil = session.usuario?.perfil
  const perfis = [...router.resolve(alvo).matched]
    .reverse()
    .find((r) => r.meta?.perfis)?.meta.perfis as PerfilUsuario[] | undefined
  if (perfis && (!perfil || !perfis.includes(perfil))) return null
  return alvo
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    cargos.value = await cadastrosAdminService.listarCargosASubstituir()
  } catch (e) {
    erro.value = axios.isAxiosError<{ message?: string }>(e)
      ? e.response?.data?.message ?? 'Não foi possível carregar os cargos a substituir.'
      : 'Não foi possível carregar os cargos a substituir.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="people-management people-workspace">
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-else-if="carregando">Carregando cargos...</p>
    <div v-else-if="cargos.length === 0" class="people-empty">Nenhum cargo precisa de substituição.</div>
    <div v-else class="people-table-wrap">
      <table class="people-table">
        <thead><tr><th>Cargo</th><th>Cadastro</th><th>Ocupante atual</th><th /></tr></thead>
        <tbody>
          <tr v-for="cargo in cargos" :key="`${cargo.tipo}-${cargo.registroId}`">
            <td>{{ rotulosTipo[cargo.tipo] }}</td>
            <td><strong>{{ cargo.descricao }}</strong></td>
            <td>{{ cargo.ocupanteNome }}</td>
            <td>
              <RouterLink v-if="destinoPermitido(cargo)" class="people-outline" :to="destinoPermitido(cargo)!">Substituir <span aria-hidden="true">→</span></RouterLink>
              <small v-else>Peça a um administrador</small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
