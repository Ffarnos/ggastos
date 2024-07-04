<template>
  <v-dialog v-model="internalDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ isEditMode ? 'Editar Gasto' : 'Nuevo Gasto' }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
              v-model="gastoInternal.name"
              label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
          ></v-text-field>
          <v-text-field
              v-model="gastoInternal.amount"
              label="Monto"
              type="number"
              :rules="[v => !!v || 'El monto es requerido', v => v > 0 || 'El monto debe ser mayor que 0']"
              required
          ></v-text-field>
          <v-select
              v-model="gastoInternal.type"
              :items="['Gasto', 'Ingreso']"
              label="Tipo"
              :rules="[v => !!v || 'El tipo es requerido']"
              required
          ></v-select>
          <v-select
              v-if="gastoInternal.type === 'Gasto'"
              v-model="gastoInternal.category"
              :items="categories"
              label="Categoría"
              :rules="[v => !!v || 'La categoría es requerida']"
              required
          ></v-select>
          <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="gastoInternal.date"
                  label="Fecha"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[v => !!v || 'La fecha es requerida']"
              ></v-text-field>
            </template>
            <v-date-picker v-model="gastoInternal.date" @input="menu = false"></v-date-picker>
          </v-menu>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="blue darken-1" text @click="saveGasto">{{ isEditMode ? 'Actualizar' : 'Guardar' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {auth, database} from "@/firebase";
import {push, ref as refDB, update} from "firebase/database";

export default {
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    categories: {
      type: Array,
      required: true
    },
    gasto: {
      type: Object,
      default: () => ({
        name: '',
        amount: '',
        category: '',
        type: '',
        date: new Date().toISOString().substr(0, 10)
      })
    }
  },
  data() {
    return {
      internalDialog: this.dialog,
      menu: false,
      gastoInternal: { ...this.gasto }
    };
  },
  watch: {
    dialog(val) {
      this.internalDialog = val;
      if (val && this.gasto.id)
        this.gastoInternal = { ...this.gasto };
    },
    internalDialog(val) {
      this.$emit('update:dialog', val);
    },
    gasto: {
      immediate: true,
      handler(newVal) {
        this.gastoInternal = { ...newVal };
      }
    }
  },
  computed: {
    isEditMode() {
      return !!this.gastoInternal.id
    }
  },
  methods: {
    closeDialog() {
      this.internalDialog = false;
      this.resetForm();
    },
    saveGasto() {
      const form = this.$refs.form;
      if (form.validate()) {
        if (this.isEditMode)
          this.updateGasto(this.gastoInternal)
        else
          this.addGasto(this.gastoInternal)

        this.closeDialog();
      }
    },
    async addGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos');
      try {
        await push(ref, { ...gasto });
        window.dispatchEvent(new Event('update-transacciones'))
        this.dialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    async updateGasto(gasto) {
      const user = auth.currentUser;
      const ref = refDB(database, 'users/' + user.uid + '/gastos/' + gasto.id);
      try {
        await update(ref, { ...gasto });
        window.dispatchEvent(new Event('update-transacciones'))
        this.dialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    resetForm() {
      this.gastoInternal = {
        name: '',
        amount: '',
        category: '',
        type: '',
        date: new Date().toISOString().substr(0, 10)
      };
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    }
  }
};
</script>
