<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>
          <v-btn color="primary" @click="openDialog">Agregar Transaccion</v-btn>
        </v-card-title>
          <v-col cols="12" md="4">
            <v-select
                v-model="selectedCategory"
                :items="categories"
                label="Filtrar por Categoría"
                clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
                v-model="selectedType"
                :items="[null,'Gasto', 'Ingreso']"
                label="Filtrar por Tipo"
                clearable
            ></v-select>
          </v-col>
        <v-data-table
            :headers="headers"
            :items="filteredGastos"
            class="elevation-1"
        >
          <template v-slot:[`item.type`]="{ item }">
            <v-chip :color="item.type === 'Gasto' ? 'red' : 'green'" dark>
              {{ item.type }}
            </v-chip>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click="deleteGasto(item)">
              mdi-delete
            </v-icon>
            <v-icon small @click="editGasto(item)">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <NuevoGasto
          :categories="categories"
          :dialog.sync="dialog"
          :gasto="currentGasto"
          @save-gasto="addGasto"
          @update-gasto="updateGasto"
      />
    </v-container>
  </div>
</template>

<script>
import NuevoGasto from "@/components/NuevoGasto.vue";
import { database } from "@/firebase";
import { get, push, update, remove, ref as refDB } from "firebase/database";
import { auth } from "@/firebase";

export default {
  components: { NuevoGasto },
  data() {
    return {
      dialog: false,
      selectedCategory: null,
      selectedType: null,

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
        { text: 'Acciones', value: 'actions'},
      ],
      categories: [null, 'Comida', 'Entretenimiento', 'Deporte', 'Salud', 'Educacion'],
    };
  },
  computed: {
    filteredGastos() {
      return this.gastos.filter(gasto => {
        const matchesCategory = this.selectedCategory
            ? gasto.category === this.selectedCategory
            : true;
        const matchesType = this.selectedType
            ? gasto.type === this.selectedType
            : true;
        return matchesCategory && matchesType;
      });
    }
  },
  created() {
    this.getGastos();
  },
  methods: {
    openDialog() {
      this.currentGasto = {
        name: '',
        amount: '',
        category: '',
        type: '',
        date: new Date().toISOString().substr(0, 10)
      };
      this.dialog = true;
    },
    async deleteGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos/' + gasto.id);
      try {
        await remove(ref);
        await this.getGastos();
      } catch (error) {
        console.log(error);
      }
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
    async addGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos');
      try {
        await push(ref, { ...gasto });
        this.dialog = false;
        await this.getGastos();
      } catch (error) {
        console.log(error);
      }
    },
    editGasto(gasto) {
      this.currentGasto = { ...gasto };
      this.dialog = true;
    },
    async updateGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos/' + gasto.id);
      try {
        await update(ref, { ...gasto });
        this.dialog = false;
        await this.getGastos();
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
