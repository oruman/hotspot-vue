<template>
  <v-container>
    <h4 class="title text-uppercase">Homework</h4>
    <template>
      <v-card flat class="d-flex">
        <strong class="subtitle-1 text-uppercase">Week 1</strong>
        <v-spacer />
        <span>2020-01-16</span>
      </v-card>
      <v-card>
        <v-card-title>
          Intro
        </v-card-title>
        <v-card-text>
          <v-icon style="text-decoration: none;">mdi-link-variant</v-icon>
          <a target="_blank" href="https://www.google.com">
            Drill 1. Pr. Continuous vs. Present Simple
          </a>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Aspects } from "@/data/data";

@Component
export default class Grammar extends Vue {
  private aspect = Aspects.GRAMMAR;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.dataForView;
  }

  private get dataForView() {
    const newData = [];
    const data = this.$store ? this.$store.getters["grades/curriculum"] : [];
    console.log(data);
    for (const items of data) {
      newData.push(
        items.filter((item: SimpleObject) => item.aspect == this.aspect)
      );
    }
    return newData;
  }
}
</script>

<style scoped></style>
