<template>
  <ul class="calendar" v-for="event in events">
    <li class="event">
      <b>{{ timeConvert(event.start.dateTime) }} - {{ timeConvert(event.end.dateTime) }}</b
      >:
      {{ event.summary }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true
    }
  },

  computed: {},

  methods: {
    timeConvert(time) {
      const convertedTime = new Date(time)
      return `${String(convertedTime.getHours()).padStart(2, '0')}:${String(
        convertedTime.getMinutes()
      ).padStart(2, '0')}`
    }
  },

  mounted() {}
}
</script>

<style scoped>
.calendar {
  padding-left: 0;
}

.event {
  border-right: 5px solid mediumaquamarine;
  text-align: left;
  list-style: none;
  background-color: var(--background-color);
  padding: 0.5rem;
}
</style>
