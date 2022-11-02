<template>
  <div>
    <v-navigation-drawer app fixed dark v-model="showMenu">
      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="wrap-normal">
              {{ name }}
            </v-list-item-title>
            <v-list-item-subtitle class="wrap-normal">
              {{ email }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action @click="routeTo('profile')">
            <v-icon>mdi-account-edit</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-divider></v-divider>
        <template v-for="(item, index) in itemsMenu">
          <v-divider v-if="item.divider" :key="`${index}_div`"></v-divider>
          <v-list-item v-else @click="item.click" :key="`${index}_item`">
            <v-list-item-action>
              <v-icon color="primary">{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app fixed dark color="primary">
      <v-app-bar-nav-icon @click.stop="toggleMenu"></v-app-bar-nav-icon>

      <v-toolbar-title>{{ routeName }}</v-toolbar-title>
      <v-spacer />
      <v-progress-circular
        v-if="isLoading"
        dark
        indeterminate
      ></v-progress-circular>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";

@Component({
  computed: mapGetters(["isLoading"])
})
export default class TopToolbar extends Vue {
  private showMenu = false;
  private itemsMenu = [
    {
      icon: "mdi-chart-line-variant",
      name: "Performance",
      click: () => {
        this.routeTo("/");
      }
    },
    {
      divider: true
    },
    {
      icon: "mdi-spellcheck",
      name: "Grammar",
      click: () => {
        this.routeTo("/grammar");
      }
    },
    {
      icon: "mdi-account-voice",
      name: "Speaking",
      click: () => {
        this.routeTo("/speaking");
      }
    },
    {
      icon: "mdi-headphones",
      name: "Listening",
      click: () => {
        this.routeTo("/listening");
      }
    },
    {
      divider: true
    },
    {
      icon: "mdi-glass-wine",
      name: "Holidays Homework",
      click: () => {
        this.routeTo("/hhw");
      }
    },
    {
      divider: true
    },
    {
      icon: "mdi-exit-to-app",
      name: "Exit",
      click: () => {
        if (confirm("Are you sure?")) this.$store.dispatch("network/LOGOUT");
      }
    }
  ];

  mounted() {
    this.$store.dispatch("state/GET_DATA");
    this.showMenu = this.$vuetify.breakpoint.mdAndUp;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  private get avatar() {
    if (this.$store) return this.$store.getters["state/avatar"];
    return "";
  }

  private get name() {
    if (this.$store) return this.$store.getters["state/name"];
    return "";
  }

  private get email() {
    if (this.$store) return this.$store.getters["state/email"];
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private doNothing(): void {}

  private routeTo(path: string) {
    if (this.$route.path !== path) this.$router.push(path);
  }

  private get routeName() {
    return this.$route.name;
  }
}
</script>

<style scoped lang="scss">
.wrap-normal {
  white-space: normal;
  overflow-wrap: break-word;
}
</style>
