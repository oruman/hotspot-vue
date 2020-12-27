<template>
  <v-container fluid>
    <v-layout column>
      <v-card>
        <v-card-text>
          <v-flex class="mb-4">
            <v-avatar size="96" class="mr-4">
              <img :src="avatar" alt="Avatar" />
            </v-avatar>
            <v-btn>Change Avatar</v-btn>
          </v-flex>
          <v-text-field v-model="email" disabled label="E-mail Address" />
          <v-text-field v-model="name" label="Name" />
          <v-text-field v-model="phone" label="Phone Number" ref="phone" />
        </v-card-text>
        <v-card-actions>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Profile extends Vue {
  private profileData: SimpleObject = {};
  private phonePosition = -1;
  private phonePosition2 = -1;
  private tmpPhone = "";
  private tm = 0;
  private phoneElement: HTMLInputElement | null = null;

  mounted() {
    const wrap = this.$refs.phone as Vue;
    this.phoneElement = wrap.$refs.input as HTMLInputElement;
  }

  private get avatar() {
    if (this.$store) return this.$store.getters["state/avatar"];
    return "";
  }

  private get name() {
    if (Object.prototype.hasOwnProperty.call(this.profileData, "name"))
      return this.profileData.name;
    if (this.$store) return this.$store.getters["state/name"];
    return "";
  }

  private set name(str) {
    Vue.set(this.profileData, "name", str);
  }

  private get email() {
    if (Object.prototype.hasOwnProperty.call(this.profileData, "email"))
      return this.profileData.email;
    if (this.$store) return this.$store.getters["state/email"];
    return "";
  }

  private set email(str) {
    Vue.set(this.profileData, "email", str);
  }

  private get phone() {
    return Object.prototype.hasOwnProperty.call(this.profileData, "phone")
      ? this.profileData.phone
      : this.$store
      ? this.formatPhone(this.$store.getters["state/phone"])
      : "";
  }

  private set phone(str) {
    clearTimeout(this.tm);
    this.tmpPhone = this.clearPhone(str);
    this.phonePosition = -1;
    if (this.phoneElement !== null) {
      let curPos = this.phoneElement.selectionStart;
      if (curPos === null || curPos == this.phoneElement.value.length)
        curPos = -1;
      if (curPos != -1) {
        let sbstr = str.substr(0, curPos);
        if (str.indexOf(sbstr) > -1) this.phonePosition2 = sbstr.length;
        if (this.phonePosition2 == -1) {
          sbstr = this.clearPhone(sbstr);
          if (sbstr.length) this.phonePosition = sbstr.length - 1;
        }
      }
    }
    this.tm = setTimeout(() => {
      const formated = this.formatPhone(this.tmpPhone);
      Vue.set(this.profileData, "phone", formated);
      if (this.phoneElement) {
        if (this.phoneElement.value != formated)
          this.phoneElement.value = formated;
        this.$nextTick(() => {
          if (this.phoneElement == null || this.phonePosition2 == -1) return;
          this.phoneElement.setSelectionRange(
            this.phonePosition2,
            this.phonePosition2
          );
          this.phonePosition2 = -1;
        });
      }
    }, 200);
  }

  private getElement() {
    const wrap = this.$refs.phone as Vue;
    return wrap.$refs.input as HTMLInputElement;
  }

  private formatPhone(str: string) {
    str = str.substr(0, 12);
    const append: SimpleObject = {
      0: "+",
      3: " (",
      5: ") ",
      8: "-",
      10: "-"
    };
    let ret = "";
    for (let i = 0; i < str.length; i++) {
      if (Object.prototype.hasOwnProperty.call(append, i)) ret += append[i];
      ret += str[i];
      if (this.phonePosition2 == -1 && i == this.phonePosition)
        this.phonePosition2 = ret.length;
    }
    return ret;
  }

  private clearPhone(str: string) {
    return str.replaceAll(/\D/g, "");
  }
}
</script>
