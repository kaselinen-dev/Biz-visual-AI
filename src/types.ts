export interface EditedImage {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}

export type ProfessionalPreset = {
  id: string;
  label: string;
  prompt: string;
  icon: string;
};

export const PROFESSIONAL_PRESETS: ProfessionalPreset[] = [
  {
    id: 'enhance',
    label: 'Executive Edge',
    prompt: 'Enhance this image to look professional for a high-stakes business presentation. Improve clarity, lighting, and sophisticated color balance.',
    icon: 'Sparkles'
  },
  {
    id: 'background',
    label: 'Corporate Backdrop',
    prompt: 'Change the background to a clean, minimalist modern corporate office with soft natural lighting.',
    icon: 'Layout'
  },
  {
    id: 'lighting',
    label: 'Authority Highlight',
    prompt: 'Apply professional studio lighting to the subject, making them look confident and reliable for a corporate profile.',
    icon: 'Sun'
  },
  {
    id: 'monochrome',
    label: 'Legacy B&W',
    prompt: 'Convert to a high-contrast, professional black and white image suitable for an executive summary.',
    icon: 'Contrast'
  }
];
