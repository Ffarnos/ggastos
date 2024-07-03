<template>
  <div class="container">
    <Resumen />
    <Transacciones />
  </div>
</template>

<script>
import Resumen from "@/components/Resumen.vue";
import Transacciones from "@/components/Transacciones.vue";

export default {
  components: { Transacciones, Resumen },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
}
</style>
