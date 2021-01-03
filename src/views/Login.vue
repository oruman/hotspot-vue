<template>
  <v-container>
    <v-layout justify-center align-center>
      <v-flex>
        <v-row>
          <v-col cols="12" lg="6" offset-lg="3" md="8" offset-md="2">
            <v-card>
              <v-card-text>
                <v-form
                  v-model="valid"
                  ref="form"
                  @keyup.native.enter="submit"
                  v-on:submit.prevent="submit"
                >
                  <v-text-field
                    v-model="email"
                    prepend-icon="mdi-email"
                    label="Email"
                    :rules="emailRules"
                  />
                  <v-text-field
                    v-model="password"
                    prepend-icon="mdi-lock"
                    label="Password"
                    type="password"
                    :rules="passwordRules"
                  />
                  <v-checkbox
                    v-model="keepMeSignedIn"
                    label="keep me signed in"
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    :disabled="!valid || isLoading"
                    @click.prevent="submit"
                    >Sign in</v-btn
                  >
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";

@Component({
  computed: mapGetters(["isLoading", "isLogged"])
})
export default class Curriculum extends Vue {
  private email = "";
  private password = "";
  private keepMeSignedIn = true;

  private alreadySubmitted = false;

  private emailRules = [
    (v: string) => !!v || "E-mail is required",
    (v: string) =>
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
      "E-mail must be valid"
  ];

  private passwordRules = [(v: string) => !!v || "Password is required"];

  private valid = false;

  private submit() {
    if (this.alreadySubmitted) return;
    this.alreadySubmitted = true;
    setTimeout(() => {
      this.alreadySubmitted = false;
    }, 500);
    const form = this.$refs.form as HTMLFormElement;
    if (!form.validate()) return;
    this.$store
      .dispatch("network/LOGIN", {
        email: this.email,
        password: this.password,
        keepMeSignedIn: this.keepMeSignedIn
      })
      .then(() => {
        if (this.$store.getters["isLogged"]) this.$router.push("/");
        else Promise.reject("not logged");
      })
      .catch(err => {
        const response = err.response;
        let message = "Invalid input";
        if (
          Object.prototype.hasOwnProperty.call(response, "data") &&
          Object.prototype.hasOwnProperty.call(response.data, "error") &&
          response.data.error
        )
          message = response.data.error;
        if (message) this.$store.dispatch("errors/ADD", message);
        this.password = "";
      });
  }
}
</script>
