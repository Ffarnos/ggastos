<template>
  <div class="main-container">
    <div class="container-row">
      <Resumen2 />
      <Transacciones/>
    </div>
    <Categorias/>
  </div>
</template>

<script>
import Resumen from "@/components/Resumen.vue";
import Transacciones from "@/components/Transacciones.vue";
import Resumen2 from "@/components/Resumen.vue";
import Categorias from "@/components/Categorias.vue";

export default {
  components: {Categorias, Resumen2, Transacciones, Resumen },
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Hace que el contenedor ocupe toda la altura de la ventana */
}

.container-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>
