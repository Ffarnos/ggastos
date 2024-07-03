<template>
  <div class="transacciones-container">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title>
            <v-btn color="primary" @click="createGasto">Agregar Transacción</v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-menu
                    ref="startDateMenu"
                    v-model="startDateMenu"
                    :close-on-content-click="true"
                    offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="startDate"
                        label="Fecha de Inicio"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        clearable
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="startDate" @input="startDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" md="6">
                <v-menu
                    ref="endDateMenu"
                    v-model="endDateMenu"
                    :close-on-content-click="true"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="endDate"
                        label="Fecha de Fin"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        clearable
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="endDate" @input="endDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-select
                  v-model="selectedCategory"
                  :items="categories"
                  label="Filtrar por Categoría"
                  clearable
              />
              <v-select
                  v-model="selectedType"
                  :items="[null, 'Gasto', 'Ingreso']"
                  label="Filtrar por Tipo"
                  clearable
              />
            </v-row>
          </v-card-text>
        </v-card>
        <v-card class="transacciones-card">
          <v-data-table
              :headers="headers"
              :items="filteredGastos"
              class="elevation-1"
              style="height: 100%; overflow-y: auto;"
          >
            <template v-slot:[`item.type`]="{ item }">
              <v-chip :color="item.type === 'Gasto' ? 'red' : 'green'" dark>{{ item.type }}</v-chip>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon small @click="deleteGasto(item)">mdi-delete</v-icon>
              <v-icon small @click="editGasto(item)">mdi-pencil</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <NuevoGasto :categories="categories" :dialog.sync="dialog" :gasto="currentGasto" />
  </div>
</template>

<script>
import NuevoGasto from "@/components/DialogTransaccion.vue";
import { database } from "@/firebase";
import { get, remove, ref as refDB } from "firebase/database";
import { auth } from "@/firebase";

export default {
  components: { NuevoGasto },
  data() {
    return {
      dialog: false,
      selectedCategory: null,
      selectedType: null,
      startDate: null,
      endDate: null,
      startDateMenu: false,
      endDateMenu: false,
      currentGasto: {
        name: '',
        amount: '',
        category: '',
        type: '',
        date: new Date().toISOString().substr(0, 10)
      },
      gastos: [],
      headers: [
        { text: 'Nombre', value: 'name' },
        { text: 'Monto', value: 'amount' },
        { text: 'Categoría', value: 'category' },
        { text: 'Tipo', value: 'type' },
        { text: 'Fecha', value: 'date' },
        { text: 'Acciones', value: 'actions' }
      ],
      categories: [null, 'Comida', 'Diversion', 'Deporte', 'Salud', 'Educacion'],
    };
  },
  computed: {
    filteredGastos() {
      return this.gastos.filter(gasto => {
        const gastoDate = new Date(gasto.date);
        const matchesCategory = this.selectedCategory ? gasto.category === this.selectedCategory : true;
        const matchesType = this.selectedType ? gasto.type === this.selectedType : true;
        const matchesStartDate = this.startDate ? gastoDate >= new Date(this.startDate) : true;
        const matchesEndDate = this.endDate ? gastoDate <= new Date(this.endDate) : true;

        return matchesCategory && matchesType && matchesStartDate && matchesEndDate;
      });
    }
  },
  mounted() {
    window.addEventListener('update-transacciones', this.getGastos);
  },
  beforeUnmount() {
    window.removeEventListener('update-transacciones', this.getGastos);
  },
  created() {
    this.getGastos();
  },
  methods: {
    createGasto() {
      this.currentGasto = {
        name: '',
        amount: '',
        category: '',
        type: '',
        date: new Date().toISOString().substr(0, 10)
      };
      this.dialog = true;
    },
    async getGastos() {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos');

      try {
        const snapshot = await get(ref);
        if (snapshot.exists()) {
          const expensesData = snapshot.val();
          this.gastos = Object.keys(expensesData).map(key => ({
            id: key,
            ...expensesData[key]
          }));
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos/' + gasto.id);
      try {
        await remove(ref);
        window.dispatchEvent(new Event('update-transacciones'));
      } catch (error) {
        console.log(error);
      }
    },
    editGasto(gasto) {
      this.currentGasto = { ...gasto };
      this.dialog = true;
    },
  }
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.transacciones-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.transacciones-card {
  height: 300px;
  display: flex;
  flex-direction: column;
}
</style>
