
<template>
  <div class="center">
    <v-card class="mt-5 pa-5">
      <div class="categoria">
        <div v-for="category in categorizedGastos" :key="category.name">
          <div>
            <v-icon color="blue">{{category.icon}}</v-icon>
            {{ category.name }}: {{ category.total }}
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import {auth, database} from "@/firebase";
import {get, ref as refDB} from "firebase/database";

const categories = [
  { name: 'Comida', icon: 'mdi-food' },
  { name: 'Diversion', icon: 'mdi-movie' },
  { name: 'Deporte', icon: 'mdi-basketball' },
  { name: 'Salud', icon: 'mdi-hospital' },
  { name: 'Educación', icon: 'mdi-school' },
];

const gastos = ref([]);

const updateCategorias = async () => {
  const user = auth.currentUser;
  const ref = refDB(database, 'users/' + user.uid + '/gastos');
  try {
    const snapshot = await get(ref);
    if (snapshot.exists())
      gastos.value = Object.values(snapshot.val())

  } catch (error) {
    console.log(error);
  }

};

const formatNumber = (number) => {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(number);
};

const categorizedGastos = computed(() => {
  return categories.map(category => {
    const total = gastos.value
        .filter(gasto => gasto.category === category.name)
        .reduce((sum, item) => sum + Number(item.amount), 0);
    return {
      ...category,
      total: formatNumber(total)
    };
  });
});


onMounted(() => {
  window.addEventListener('update-transacciones', updateCategorias);
  updateCategorias();
});


</script>

<style scoped>
.category-sheet {
  display: flex;
  align-items: center;
  padding: 20px 10px;
  margin-bottom: 10px;
  gap: 2px
}

.categoria {
  display: flex;
  flex-direction: row;
  gap: 40px;
}

</style>