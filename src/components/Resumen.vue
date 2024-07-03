<template>
  <v-card>
    <v-card-title class="title-center">Resumen de Movimientos</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="summary-card">
            <v-card-title class="title-center">INGRESOS</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-sheet class="summary-sheet" outlined>
                    <v-icon color="green">mdi-cash</v-icon>
                    <span>Total: {{ formattedTotalIngresos }}</span>
                  </v-sheet>
                  <v-sheet class="summary-sheet" outlined>
                    <v-icon color="green">mdi-calendar-month</v-icon>
                    <span>Mensual {{ currentMonthName }}: {{ formattedMensualIngresos }}</span>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="summary-card">
            <v-card-title class="title-center">EGRESOS</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-sheet class="summary-sheet" outlined>
                    <v-icon color="red">mdi-cash-remove</v-icon>
                    <span>Total: {{ formattedTotalGastos }}</span>
                  </v-sheet>
                  <v-sheet class="summary-sheet" outlined>
                    <v-icon color="red">mdi-calendar-month</v-icon>
                    <span>Mensual {{ currentMonthName }}: {{ formattedMensualGastos }}</span>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card class="summary-card">
            <v-card-title class="title-center">Categorias de gastos</v-card-title>
            <v-card-text>
              <v-row>
                <v-col v-for="category in categorizedGastos" :key="category.name" cols="12" md="4">
                  <v-sheet class="category-sheet" outlined>
                    <v-icon color="blue">{{ category.icon }}</v-icon>
                    <span>{{ category.name }}: {{ category.total }}</span>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

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
.title-center {
  text-align: center;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-sheet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
}

.category-sheet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
