<template>
  <div class="timer">
    <svg class="timer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="timer-circle">
        <circle class="time-elapsed-path" cx="50" cy="50" r="45" />
        <path
          class="time-left-path"
          v-if="timeLeft > 0"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
          :style="{ strokeDasharray }"
        ></path>
      </g>
    </svg>
    <div class="time-left-container">
      <span class="time-left-label">{{ timeLeftString }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { timerInterval: null, timeLeft: 0 }
  },

  computed: {
    timeLeftString() {
      const timeLeft = this.timeLeft
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      return `${this.padToTwo(minutes)}:${this.padToTwo(seconds)}`
    },
    strokeDasharray() {
      const radius = 45
      const total = 2 * Math.PI * radius
      const timeFraction = this.timeLeft / this.limit
      const adjTimeFraction = timeFraction - (1 - timeFraction) / this.limit
      const elapsedDash = Math.floor(adjTimeFraction * total)
      return `${elapsedDash} ${total}`
    }
  },

  props: {
    limit: {
      type: Number,
      required: true
    }
  },

  methods: {
    padToTwo(num) {
      return String(num).padStart(2, '0')
    }
  },

  mounted() {
    this.timeLeft = this.limit
    this.timerInterval = setInterval(() => {
      if (--this.timeLeft === 0) {
        clearInterval(this.timerInterval)
      }
    }, 1000)
  }
}
</script>

<style scoped>
.timer {
  height: 300px;
  width: 300px;
  position: relative;
}

.timer-circle {
  fill: none;
  stroke: none;
}

.time-elapsed-path {
  stroke-width: 7px;
  stroke: #424242;
}

.time-left-path {
  stroke-width: 7px;

  stroke-linecap: round;

  transform: rotate(90deg);
  transform-origin: center;

  transition: 1s linear all;

  stroke: mediumaquamarine;
}

.time-left-container {
  height: inherit;
  width: inherit;

  position: absolute;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.time-left-label {
  font-size: 50px;
  color: white;
}
</style>
