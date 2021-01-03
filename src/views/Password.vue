<template>
  <v-container>
    <v-layout justify-center align-center>
      <v-flex>
        <v-row>
          <v-col cols="12" lg="6" offset-lg="3" md="8" offset-md="2">
            <v-btn small text @click.prevent="gotoProfile" class="pl-0 mb-4">
              <v-icon>mdi-arrow-left</v-icon>
              Return to profile
            </v-btn>
            <v-form
              v-model="valid"
              ref="form"
              @keyup.native.enter="submit"
              v-on:submit.prevent="submit"
            >
              <v-card>
                <v-card-text>
                  <v-text-field
                    v-model="passwordOld"
                    label="Current Password"
                    type="password"
                    :rules="passwordRules"
                  />
                  <v-text-field
                    v-model="passwordNew"
                    label="Set New Password"
                    type="password"
                    :rules="passwordRules"
                  />
                  <v-text-field
                    v-model="passwordConfirm"
                    label="Confirm Password"
                    type="password"
                    :rules="
                      passwordRules.concat([
                        v =>
                          v === passwordNew ||
                          'The password confirmation does not match.'
                      ])
                    "
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    :disabled="!valid || isLoading"
                    @click.prevent="submit"
                  >
                    Change password
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
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
  computed: mapGetters(["isLoading"])
})
export default class Password extends Vue {
  private valid = false;
  private alreadySubmitted = false;

  private passwordOld = "";
  private passwordNew = "";
  private passwordConfirm = "";

  private passwordRules = [(v: string) => !!v || "This field is required"];

  private submit() {
    if (this.alreadySubmitted) return;
    this.alreadySubmitted = true;
    setTimeout(() => {
      this.alreadySubmitted = false;
    }, 500);
    const form = this.$refs.form as HTMLFormElement;
    if (!form.validate()) return;
    this.$store
      .dispatch("network/UPDATE_PASSWORD", {
        oldPass: this.passwordOld,
        newPass: this.passwordNew
      })
      .then(() => {
        this.gotoProfile();
      });
  }

  private gotoProfile() {
    this.$router.push("/profile");
  }
}
</script>
