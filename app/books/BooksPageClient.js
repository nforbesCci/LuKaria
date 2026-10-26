'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import BookCarousel from '../../components/BookCarousel';
import { Container, Typography, Box } from '@mui/material';
import styles from './books.module.css';

const AMAZON_URL = 'https://a.co/d/0as3nikh';

export default function BooksPageClient() {
  return (
    <>
      <PublicTopMenu currentPath="/books" />
      <PublicTopBar />
      <Container maxWidth="md" sx={{ mt: 14, mb: 8 }}>
        <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
          The Svelte Table
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', maxWidth: 720, lineHeight: 1.7 }}>
          A luxuriously Jamaican cookbook by Dr. Kadria Fairclough. Familiar island food from the Svelte by LuKaria
          kitchen, including meals shaped for anyone on a GLP-1 medication. The book is available now.
        </Typography>
        <Box sx={{ mb: 4 }}>
          <a className={styles.cta} href={AMAZON_URL} target="_blank" rel="noopener noreferrer">
            Available now on Amazon
          </a>
        </Box>

        <div className={styles.carouselWrap}>
          <BookCarousel priorityFirst />
        </div>
      </Container>
    </>
  );
}
