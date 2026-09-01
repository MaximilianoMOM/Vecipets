export default function EventosPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', color: '#1f2937' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Eventos y Jornadas</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Entérate de las próximas jornadas de vacunación, esterilización y adopción.</p>
      </div>

      <div style={{ background: '#ffffff', padding: '40px', borderRadius: '20px', border: '1px solid #f3f4f6', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No hay eventos programados para hoy</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Vuelve pronto para conocer las actividades comunitarias en tu sector.</p>
      </div>
    </div>
  );
}