<template>
  <v-container>
    <v-row>
      <v-col cols="12" v-for="item of files" :key="item.id">
        <Audio
          :file="item.link"
          :title="item.name"
          :downloadable="true"
        ></Audio>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Audio from "@/components/Audio.vue";

@Component({
  components: {
    Audio
  }
})
export default class MonSpeaking extends Vue {
  mounted() {
    this.$store.dispatch("monspeaking/GET_DATA");
  }

  private get files() {
    return this.$store ? this.$store.getters["monspeaking/files"] : [];
  }
}
</script>
