<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
import { useCartStore } from './stores/cart'

const cartStore = useCartStore()
const cartCount = computed(() => cartStore.itemCount)

onMounted(() => {
  void cartStore.fetchCartItems()
})
</script>

<template>
  <TheHeader :cart-count="cartCount" />
  <main>
    <router-view />
  </main>
  <TheFooter />
</template>

<style scoped></style>
