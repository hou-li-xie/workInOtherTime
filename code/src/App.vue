<script setup lang="ts">
import { RouterView } from "vue-router";
const getLocation = () => {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      localStorage.setItem(
        "loaction",
        JSON.stringify({ longitude: lon, latitude: lat })
      );
    },
    function (error) {
      console.log("Error occurred. Error code: " + error.code);
      // error.code 可以是：0, 1,或2
    }
  );
};
getLocation();
</script>

<template>
  <router-view />
</template>

<style>
#app {
  height: 100%;
  width: 100%;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 暗色主题样式 */
:root.dark {
  --el-bg-color: #141414;
  --el-bg-color-overlay: #1d1e1f;
  --el-text-color-primary: #ffffff;
  --el-text-color-regular: #d0d0d0;
  --el-border-color: #303030;
}

/* 过渡动画 */
* {
  transition: background-color 0.3s, border-color 0.3s;
}
</style>
