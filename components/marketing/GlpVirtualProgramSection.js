'use client';

import { Box, Typography, Paper } from '@mui/material';

const steps = [
  {
    title: 'Book your consultation.',
    body:
      'You choose a time that works for you so we can reserve time for a proper, thorough conversation. This is your time to be heard, not rushed.',
  },
  {
    title: 'Complete your Intake and history.',
    body:
      'Before your visit, you’ll share details about your health, medications, allergies, and goals. This helps us come prepared and makes your consultation more meaningful.',
  },
  {
    title: 'Video consultation with Dr. Fairclough.',
    body:
      'During your video consultation, Dr. Fairclough takes the time to understand your full picture. You’ll talk through your options, including GLP-1 medications and non-medication approaches. You’ll get clear, honest answers to your questions. If treatment isn’t appropriate, that will be explained with care and guidance on what to do next.',
  },
  {
    title: 'Your personalized plan.',
    body:
      'If you’re a good candidate, your plan is tailored specifically to you. You’ll know exactly how to use your medication (if prescribed), what to expect in the early weeks, and when to check in or flag any concerns.',
  },
  {
    title: 'Ongoing follow-up and support.',
    body:
      'This isn’t a one-time visit. Your progress, side effects, and any necessary adjustments are monitored over time through virtual follow-ups. This is based on your needs, not a fixed template.',
  },
  {
    title: 'Coordination and documentation.',
    body:
      'Where needed, we provide proper documentation and coordinate with other healthcare providers you choose, so your care stays seamless and well-supported.',
  },
];

/**
 * “Svelte Virtual Program in Jamaica” journey — shared across GLP-1 landing pages.
 */
export default function GlpVirtualProgramSection() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }} component="section" aria-labelledby="glp-virtual-program-heading">
      <Typography id="glp-virtual-program-heading" variant="h5" sx={{ color: '#877449', mb: 2, fontWeight: 700 }}>
        The Svelte Virtual Program in Jamaica—step by step
      </Typography>
      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mb: 3 }}>
        Our virtual weight loss service in Jamaica is designed to give you structured, medical care without the hassle of
        sitting in a waiting room for every step. If you’re in Jamaica, here’s what the journey typically looks like:
      </Typography>
      <Box
        component="ol"
        sx={{
          m: 0,
          pl: 2.5,
          color: '#333',
          '& li': { mb: 2, lineHeight: 1.75, pl: 0.5 },
        }}
      >
        {steps.map(({ title, body }) => (
          <Typography key={title} component="li" variant="body1">
            <Box component="strong" sx={{ color: '#877449', fontWeight: 700 }}>
              {title}
            </Box>{' '}
            {body}
          </Typography>
        ))}
      </Box>
      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mt: 3, mb: 2 }}>
        Transparency is an important part of safe, quality care. Your weight loss provider in Jamaica should clearly
        explain their fees, what is included in your visits or membership, and what falls outside of scope (such as
        emergency or hospital-based services). You should always feel comfortable asking questions until you fully
        understand your care plan.
      </Typography>
      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mb: 3 }}>
        At Svelte by LuKaria, Dr. Fairclough and her team prioritize your safety, informed consent, and setting realistic
        expectations. The focus is not on promising quick or guaranteed results on the scale, but on providing thoughtful,
        medically guided care that supports sustainable progress over time.
      </Typography>
      <Typography variant="h6" sx={{ color: '#877449', fontWeight: 700, mb: 1.5 }}>
        Why medical oversight matters
      </Typography>
      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75 }}>
        Weight-loss medications like GLP-1s may impact overall health. Using them without proper medical guidance—through
        overseas orders, self-direction, or telehealth with little follow-up—can be risky. When choosing a weight-loss
        clinic in Jamaica, look for clear physician leadership, accessible practice information, informed consent, and a
        plan for urgent concerns. At Svelte by LuKaria, care is physician-led, educational, and documented, not based on
        social media hype.
      </Typography>
    </Paper>
  );
}
