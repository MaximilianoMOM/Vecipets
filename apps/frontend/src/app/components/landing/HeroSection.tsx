import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 w-full">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 max-w-3xl mb-6">
                Encuentra y ayuda a las mascotas perdidas en tu comunidad 🐾
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8">
                VeciPets conecta vecinos para reportar alertas, buscar animales extraviados y mantener segura a nuestra comunidad peluda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/registro"
                    className="px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg"
                >
                    Regístrate Gratis
                </Link>
                <Link
                    href="/reportar"
                    className="px-6 py-3 text-base font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                    Reportar una Mascota
                </Link>
            </div>
        </section>
    );
}