<template>
  <v-bottom-navigation app fixed grow v-model="activeItem" color="primary">
    <v-btn
      v-bind:value="item.id"
      v-for="item in items"
      :to="{ path: '/' + item.path }"
      :key="item.name"
    >
      <span>{{ item.name }}</span>
      <v-icon>{{ item.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class BottomNav extends Vue {
  private activeItem = "";
  private items = [
    {
      id: "overview",
      name: "Overview",
      icon: "mdi-face",
      path: ""
    },
    {
      id: "curriculum",
      name: "Curriculum",
      icon: "mdi-calendar-text",
      path: "curriculum"
    },
    {
      id: "materials",
      name: "Materials",
      icon: "mdi-file-document-multiple-outline",
      path: "materials"
    }
  ];

  mounted() {
    const path: string[] = this.$route.path.split("/");
    const fpPath = path.length > 1 ? path[1] : "";
    for (let i = 0; i < this.items.length; i++) {
      if (fpPath == this.items[i].path) {
        this.activeItem = this.items[i].id;
        break;
      }
    }
    if (!this.activeItem && this.items.length)
      this.activeItem = this.items[0].id;
  }
}
</script>
