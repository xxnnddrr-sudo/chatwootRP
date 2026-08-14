<script setup>
import { computed } from 'vue';
import Icon from 'next/icon/Icon.vue';
import * as Sentry from '@sentry/vue';
import FormSelect from 'v3/components/Form/Select.vue';

const props = defineProps({
  value: {
    type: String,
    required: true,
    validator: value =>
      ['ding', 'bell', 'chime', 'magic', 'ping', 'blitzkrieg', 'amber', 'f1'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['change']);

const alertTones = computed(() => [
  { value: 'ding', label: 'Ding' },
  { value: 'bell', label: 'Bell' },
  { value: 'chime', label: 'Chime' },
  { value: 'magic', label: 'Magic' },
  { value: 'ping', label: 'Ping' },
  { value: 'blitzkrieg', label: 'Blitzkrieg' },
  { value: 'amber', label: 'Amber' },
  { value: 'f1', label: 'F1' },
]);

const selectedValue = computed({
  get: () => props.value,
  set: value => {
    emit('change', value);
  },
});

const audio = new Audio();
const playAudio = async () => {
  try {
    audio.src = `/audio/dashboard/${selectedValue.value}.mp3`;
    await audio.play();
  } catch (error) {
    Sentry.captureException(error);
  }
};
</script>