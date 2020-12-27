<template>
  <v-container>
    <v-btn small text @click.prevent="gotoProfile" class="pl-0 mb-4">
      <v-icon>mdi-arrow-left</v-icon>
      Return to profile
    </v-btn>
    <v-card>
      <v-card-text class="text-center">
        <input
          ref="input"
          type="file"
          name="image"
          accept="image/*"
          @change="setImage"
        />
        <vue-cropper
          :src="img"
          :background="false"
          :aspect-ratio="1"
          :auto-crop-area="1"
          :view-mode="1"
          :min-container-height="300"
          :max-container-height="300"
          ref="cropper"
          @crop="changeCrop"
        />
        <v-avatar :size="200" class="ma-5">
          <img :src="croppedAvatar" />
        </v-avatar>
      </v-card-text>
      <v-card-actions>
        <v-btn small @click.prevent="showFileChooser" :disabled="isLoading">
          <v-icon>mdi-upload</v-icon>
          Upload photo
        </v-btn>
        <v-spacer />
        <v-btn
          small
          @click.prevent="saveAvatar"
          :disabled="!isEnabled || isLoading"
        >
          <v-icon>mdi-content-save</v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

@Component({
  components: { VueCropper },
  computed: mapGetters(["isLoading"])
})
export default class Avatar extends Vue {
  private imgSrc = "";
  private dataImg = "";
  private flagChanged = false;

  private changeCrop() {
    const cropper: any = this.$refs.cropper;
    if (Object.prototype.hasOwnProperty.call(cropper, "getCroppedCanvas")) {
      const croppedCanvas: HTMLCanvasElement = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        const dataUrl = croppedCanvas.toDataURL();
        if (dataUrl) this.dataImg = dataUrl;
      }
    }
  }

  private get avatar() {
    return this.$store ? this.$store.getters["state/avatar"] : "";
  }

  private get img() {
    this.replacedCropper();
    return this.imgSrc ? this.imgSrc : this.avatar;
  }

  private get croppedAvatar() {
    return this.dataImg ? this.dataImg : this.avatar;
  }

  private replacedCropper() {
    // rebuild cropperjs with the updated source
    this.$nextTick(() => {
      const cropper: any = this.$refs.cropper;
      cropper.replace(this.img);
      this.changeCrop();
    });
  }

  private showFileChooser() {
    const ref: HTMLInputElement = this.$refs.input as HTMLInputElement;
    ref.click();
  }

  private setImage(e: any) {
    const file = e.target.files[0];
    if (file.type.indexOf("image/") === -1) {
      alert("Please select an image file");
      return;
    }
    if (typeof FileReader === "function") {
      const reader = new FileReader();
      reader.onload = () => {
        if (!reader.result || typeof reader.result != "string") return;
        this.imgSrc = reader.result;
        this.flagChanged = true;
        this.replacedCropper();
      };
      reader.readAsDataURL(file);
    } else {
      alert("Sorry, FileReader API not supported");
    }
  }

  private saveAvatar() {
    if (!this.dataImg) return;
    this.$store.dispatch("network/UPDATE_AVATAR", this.dataImg).then(() => {
      this.dataImg = "";
      this.imgSrc = "";
      this.flagChanged = false;
      this.gotoProfile();
    });
  }

  private get isEnabled() {
    console.log(this.flagChanged);
    return this.dataImg.length > 0;
  }

  private gotoProfile() {
    this.$router.push("/profile");
  }
}
</script>

<style scoped lang="scss">
input[type="file"] {
  display: none;
}
</style>
