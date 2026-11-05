import HeroSection from './components/landing/HeroSection';
import AlertasRecientes from './components/landing/AlertasRecientes';
import ComoFunciona from './components/landing/ComoFunciona';
import MapaSeccion from './components/landing/MapaSeccion';

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <AlertasRecientes />
            <ComoFunciona />
            <MapaSeccion />
        </>
    );
}