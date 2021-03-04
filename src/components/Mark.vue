<template>
  <b v-if="mark" :class="colorClassForMark">{{ mark }}</b>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Mark extends Vue {
  @Prop({ default: "" }) readonly mark!: string;
  private colors: SimpleObject = {
    "+": "mark-plus",
    "+/-": "mark-middle",
    "-": "mark-minus",
    H: "mark-absence"
  };

  private get colorClassForMark() {
    return Object.prototype.hasOwnProperty.call(this.colors, this.mark)
      ? this.colors[this.mark]
      : "";
  }
}
</script>

<style scoped lang="scss">
.mark-plus,
.mark-minus,
.mark-middle,
.mark-absence {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: solid 1px transparent;
  box-sizing: border-box;
  line-height: 28px;
  text-align: center;
}
.mark-plus {
}
.mark-minus {
  background-color: #f90000;
  border-color: #f90000;
  color: white;
}
.mark-middle {
  border-color: black;
  color: #f90000;
}
.mark-absence {
  background-color: #969696;
  border-color: #9696;
  color: black;
}
</style>
