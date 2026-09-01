import { Mascota } from "../types/mascota";

type Props = {
  mascota: Mascota;
  onClick?: () => void;
};

export default function MascotaCard({ mascota, onClick }: Props) {
  return (
    <article className="mascota-card">
      <div className="mascota-card-image">
        {mascota.imagen ? (
          <img src={mascota.imagen} alt={mascota.nombre} />
        ) : (
          <div className="mascota-placeholder">
            🐾
          </div>
        )}

        <span
          className={`estado-badge ${
            mascota.tipo === "perdida"
              ? "estado-perdida"
              : "estado-encontrada"
          }`}
        >
          {mascota.tipo === "perdida"
            ? "Mascota perdida"
            : "Mascota encontrada"}
        </span>
      </div>

      <div className="mascota-card-content">
        <h3>{mascota.nombre || "Sin nombre"}</h3>

        <p className="mascota-especie">
          {mascota.especie} · {mascota.raza}
        </p>

        <div className="mascota-info">
          <span>
            <strong>Color:</strong> {mascota.color}
          </span>

          <span>
            <strong>Tamaño:</strong> {mascota.tamaño}
          </span>

          <span>
            <strong>Sexo:</strong> {mascota.sexo}
          </span>

          <span>
            <strong>Sector:</strong> {mascota.sector}
          </span>
        </div>

        <p className="mascota-fecha">
          📅 {mascota.fecha}
        </p>

        <button
          type="button"
          className="btn-ver-detalle"
          onClick={onClick}
        >
          Ver detalles
        </button>
      </div>
    </article>
  );
}