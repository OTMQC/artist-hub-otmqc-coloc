import dynamic from 'next/dynamic';
const ArtistHub = dynamic(() => import('../components/ArtistHub'), { ssr: false });

export default function Home() {
  return <ArtistHub />;
}