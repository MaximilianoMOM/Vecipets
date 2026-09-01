export default function ConsejosPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', color: '#1f2937' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Consejos de Seguridad</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Qué hacer y cómo actuar ante la pérdida o hallazgo de una mascota.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {[
          { title: '¿Qué hacer si pierdes a tu perro?', desc: 'Mantén la calma, recorre la ruta habitual de paseo en las primeras 2 horas y reporta inmediatamente en VeciPets.' },
          { title: '¿Cómo actuar si encuentras un gato asustado?', desc: 'Evita movimientos bruscos, no lo persigas y ofrécele un espacio seguro con agua mientras la comunidad responde.' }
        ].map((tip, idx) => (
          <div key={idx} style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{tip.title}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}