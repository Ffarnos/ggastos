<template>
  <form name="contact" >
    <div class="container">
      <div class="card-wrapper">
        <div>
          <p class="title">GGASTOS</p>
          <div class="container-center">
          </div>

          <template>
            <div class="others-container">
              <div class="text-field-container">
                <input
                    v-model="email"
                    type="email"
                    placeholder="Ingrese su email"
                    required
                />

                <input v-model="name" v-if="register === 'signup'" placeholder="Nombre"/>
                <input v-model="surname" v-if="register === 'signup'" placeholder="Apellido" />

                <input
                    v-if="register === 'signup' || register === 'signin'"
                    v-model="password"
                    type="password"
                    placeholder="Contraseña"
                    required
                />

                <div v-if="register === 'signin'">
                  <p
                      v-if="sendPasswordMail"
                      style="margin-top: 10px"
                  >
                    Se ha enviado un email para restablecer la contraseña
                  </p>
                  <div class="password-reset-container" v-else @click="handleChangePass">
                    <p class="password-reset">Restablecer Contraseña</p>
                  </div>
                </div>

              </div>
              <p class="iniciar-sesion-button" @click="handleLogin">
                Continuar
              </p>
            </div>
          </template>

          <p v-if="error" class="error-text">{{ error }}</p>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '@/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref as dbRef, set, get } from 'firebase/database';
import { ref } from 'firebase/database';

export default {
  components: {
  },
  data() {
    return {
      email: "",
      password: "",
      name: "",
      surname: "",
      error: "",
      register: "",
      sendPasswordMail: false
    };
  },
  created() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.$router.push('/inicio');
      }
    });
  },
  methods: {
    async handleChangePass() {
      try {
        await sendPasswordResetEmail(auth, this.email);
        this.sendPasswordMail = true;
        const currentTime = new Date().getTime();
        localStorage.setItem('lastPasswordResetTimestamp', currentTime.toString());
      } catch (error) {
        console.error('Error al verificar el correo electrónico:', error);
      }
    },

    async handleLogin() {
      try {
        if (this.register === '') {
          const isRegister = await this.checkEmailIsRegistered(this.email);
          if (isRegister)
            this.register = 'signin';
          else
            this.register = 'signup';
        } else if (this.register === 'signin') {
          try {
            await signInWithEmailAndPassword(auth, this.email, this.password);
          } catch (error) {
            console.log(error)
          }

        } else if (this.register === 'signup') {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;
          const usersRef = dbRef(getDatabase(), 'users/' + user.uid);

          const newUser = {
            email: this.email,
            name: this.name,
            surname: this.surname,
            role: 'user',
            gastos: []
          };

          await set(usersRef, newUser);
        }
      } catch (error) {
        console.log(error)
      }
    },
    async checkEmailIsRegistered() {
      try {

        const dbRef = ref(database, 'users');

        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const users = snapshot.val();
          return Object.values(users).some((user) => user.email === this.email);
        }
        return false;
      } catch (error) {
        console.error('Error al verificar el correo electrónico:', error);
        return false;
      }
    },

  }

};


</script>

<style>
.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.card-wrapper {
  width: 70%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container-center {
  display: flex;
  justify-content: center;
}

.others-container {
  width: 100%;
  margin: 0 auto;
}

.text-field-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-wrapper:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-wrapper h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.card-wrapper form {
  display: flex;
  flex-direction: column;
}

.card-wrapper input {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.card-wrapper input:focus {
  border-color: #007bff;
  outline: none;
}

.card-wrapper button {
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.card-wrapper button:hover {
  background-color: #0056b3;
}

.card-wrapper p {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.card-wrapper a {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.card-wrapper a:hover {
  color: #0056b3;
}

.password-reset-container {
  margin-top: 10px;
}

.password-reset {
  text-decoration: underline;
  color: #007bff;
  cursor: pointer;
  transition: color 0.3s;
}

.password-reset:hover {
  color: #0056b3;
}

.iniciar-sesion-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #007BFF;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.iniciar-sesion-button:hover {
  filter: brightness(0.3);
}

.error-text {
  margin-top: 20px;
  color: red;
}
</style>
