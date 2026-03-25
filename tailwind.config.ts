import type { Config } from 'tailwindcss';
import designSystemConfig from '@lastro-co/design-system/tailwind.config';

export default {
  presets: [designSystemConfig],
} satisfies Config;