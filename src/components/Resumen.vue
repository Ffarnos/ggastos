<template>
  <v-card class="pa-5">
    <div>
      <p>
        INGRESOS
      </p>
      <div>
        <v-sheet class="summary-sheet" outlined>
          <v-icon color="green">mdi-cash</v-icon>
          <span>Total: {{ formattedTotalIngresos }}</span>
        </v-sheet>
        <v-sheet class="summary-sheet" outlined>
          <v-icon color="green">mdi-calendar-month</v-icon>
          <span>Mensual: {{ formattedMensualIngresos }}</span>
        </v-sheet>
      </div>
    </div>

    <div>
      <p>
        EGRESOS
      </p>
      <div>
        <v-sheet class="summary-sheet" outlined>
          <v-icon color="green">mdi-cash</v-icon>
          <span>Total: {{ formattedTotalGastos }}</span>
        </v-sheet>
        <v-sheet class="summary-sheet" outlined>
          <v-icon color="green">mdi-calendar-month</v-icon>
          <span>Mensual: {{ formattedMensualGastos }}</span>
        </v-sheet>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { database } from "@/firebase";
import { get, ref as refDB } from "firebase/database";
import { auth } from "@/firebase";

const totalIngresos = ref(0);
const mensualIngresos = ref(0);
const totalGastos = ref(0);
const mensualGastos = ref(0);
const gastos = ref([]);

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const currentMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());

const categories = [
  { name: 'Comida', icon: 'mdi-food' },
  { name: 'Diversion', icon: 'mdi-movie' },
  { name: 'Deporte', icon: 'mdi-basketball' },
  { name: 'Salud', icon: 'mdi-hospital' },
  { name: 'Educación', icon: 'mdi-school' },
];

const formatNumber = (number) => {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(number);
};

const formattedTotalIngresos = computed(() => formatNumber(totalIngresos.value));
const formattedMensualIngresos = computed(() => formatNumber(mensualIngresos.value));
const formattedTotalGastos = computed(() => formatNumber(totalGastos.value));
const formattedMensualGastos = computed(() => formatNumber(mensualGastos.value));

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

const updateResumen = async () => {
  const user = auth.currentUser;
  const ref = refDB(database, 'users/' + user.uid + '/gastos');

  let ingresos = [];
  let egresos = [];

  try {
    const snapshot = await get(ref);
    if (snapshot.exists()) {
      gastos.value = Object.values(snapshot.val())
      gastos.value.forEach((gasto) => {
        if (gasto.type === 'Ingreso')
          ingresos.push(gasto)
        else egresos.push(gasto)
      })
    }
  } catch (error) {
    console.log(error);
  }

  totalIngresos.value = ingresos.reduce((sum, item) => sum + Number(item.amount), 0);
  totalGastos.value = egresos.reduce((sum, item) => sum + Number(item.amount), 0);

  mensualIngresos.value = ingresos
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + Number(item.amount), 0);

  mensualGastos.value = egresos
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + Number(item.amount), 0);
};


onMounted(() => {
  window.addEventListener('update-transacciones', updateResumen);
  updateResumen();
});

</script>

<style scoped>
.summary-sheet {
  display: flex;
  padding: 20px 10px;
  margin-bottom: 10px;
  gap: 2px
}

</style>
