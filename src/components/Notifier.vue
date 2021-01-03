<template>
  <v-snackbar v-model="snackbar" :timeout="3000">{{ message }}</v-snackbar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Notifier extends Vue {
  private get message() {
    return this.$store ? this.$store.getters["errors/last"] : "";
  }

  private get snackbar(): boolean {
    return this.message.length > 0;
  }

  private set snackbar(flag: boolean) {
    if (!flag) this.$store.dispatch("errors/ADD", "");
  }
}
</script>
