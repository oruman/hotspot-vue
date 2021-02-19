export const DefaultChartOptions = {
  chart: {
    height: 225,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#000",
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
    },
    toolbar: {
      show: false
    },
    foreColor: "#939393"
  },
  colors: ["#F90000"],
  dataLabels: {
    enabled: true
  },
  stroke: {
    curve: "smooth"
  },
  grid: {
    borderColor: "#e7e7e7"
  },
  markers: {
    size: 1
  },
  xaxis: {
    categories: ["Start", "1 mon", "2 mon", "3 mon", "Final"]
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 2
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -25,
    offsetX: -5
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.6,
      stops: [0, 100]
    }
  },
  tooltip: {
    enabled: false
  }
};
