import Script from 'next/script';

export default function BarcodeScannerLayout({ children }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js"
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}
