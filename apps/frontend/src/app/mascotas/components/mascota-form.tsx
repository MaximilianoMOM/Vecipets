"use client";

import { useState } from "react";

export default function MascotaForm() {
  const [tipo, setTipo] = useState<"perdida" | "encontrada">(
    "perdida"
  );

  const [imagenes, setImagenes] = useState<File[]>([]);

  function handleImages(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!event.target.files) {
      return;
    }

    const archivos = Array.from(event.target.files).slice(0, 3);

    setImagenes(archivos);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    console.log("Reporte publicado");
    console.log({
      tipo,
      imagenes,
    });
  }

  return (
    <form
      className="mascota-form"
      onSubmit={handleSubmit}
    >
      {/* INFORMACIÓN DE LA MASCOTA */}
      <section className="form-section">
        <h3>
          🐾 Información de la Mascota
        </h3>

        <div className="tipo-reporte">
          <button
            type="button"
            className={tipo === "perdida" ? "activo" : ""}
            onClick={() => setTipo("perdida")}
          >
            🔎 Mascota Perdida
          </button>

          <button
            type="button"
            className={
              tipo === "encontrada" ? "activo" : ""
            }
            onClick={() => setTipo("encontrada")}
          >
            🔵 Mascota Encontrada
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre de la Mascota
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ej: Firulais, Lucas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="especie">
              Especie <span>*</span>
            </label>

            <select
              id="especie"
              name="especie"
              defaultValue="Perro"
            >
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="raza">
              Raza
            </label>

            <input
              id="raza"
              name="raza"
              type="text"
              placeholder="Ej: Criollo, Labrador"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">
              Color Principal <span>*</span>
            </label>

            <input
              id="color"
              name="color"
              type="text"
              placeholder="Ej: Blanco con manchas café"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tamaño">
              Tamaño
            </label>

            <select
              id="tamaño"
              name="tamaño"
              defaultValue="Mediano"
            >
              <option value="Pequeño">
                Pequeño
              </option>

              <option value="Mediano">
                Mediano
              </option>

              <option value="Grande">
                Grande
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sexo">
              Sexo
            </label>

            <select
              id="sexo"
              name="sexo"
              defaultValue="Macho"
            >
              <option value="Macho">
                Macho
              </option>

              <option value="Hembra">
                Hembra
              </option>

              <option value="Desconocido">
                Desconocido
              </option>
            </select>
          </div>

          <div className="form-group full">
            <label htmlFor="caracteristicas">
              Señas o Características Especiales
            </label>

            <input
              id="caracteristicas"
              name="caracteristicas"
              type="text"
              placeholder="Ej: Collar rojo, cicatriz en oreja izquierda"
            />
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="form-section">
        <h3>
          📍 Ubicación y Fecha del Reporte
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fecha">
              Fecha del Suceso <span>*</span>
            </label>

            <input
              id="fecha"
              name="fecha"
              type="date"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sector">
              Barrio o Sector <span>*</span>
            </label>

            <input
              id="sector"
              name="sector"
              type="text"
              placeholder="Ej: Belén, Antioquia"
            />
          </div>
        </div>

        <div className="mapa-container">
          <div className="mapa-header">
            Selecciona la ubicación exacta en el mapa
            <small>
              (Haz clic sobre el mapa)
            </small>
          </div>

          <iframe
            title="Mapa de ubicación"
            className="mapa"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-75.62%2C6.20%2C-75.54%2C6.29&layer=mapnik&marker=6.2442%2C-75.5812"
          />

          <p className="coordenadas">
            Coordenadas seleccionadas:
            {" "}
            6.2442, -75.5812
          </p>
        </div>
      </section>

      {/* FOTOGRAFÍAS */}
      <section className="form-section">
        <h3>
          📷 Fotografías de la Mascota
        </h3>

        <label className="upload-box">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />

          <span className="upload-icon">
            📷
          </span>

          <strong>
            Haz clic para subir hasta 3 fotografías
          </strong>

          <small>
            Formatos soportados: JPG, PNG o WEBP
          </small>

          {imagenes.length > 0 && (
            <span className="files-selected">
              {imagenes.length} fotografía(s)
              seleccionada(s)
            </span>
          )}
        </label>
      </section>

      {/* DESCRIPCIÓN */}
      <section className="form-section">
        <div className="form-group">
          <label htmlFor="descripcion">
            Descripción Adicional
          </label>

          <textarea
            id="descripcion"
            name="descripcion"
            rows={4}
            placeholder="Detalles adicionales del lugar o circunstancias..."
          />
        </div>
      </section>

      <button
        type="submit"
        className="btn-publicar-form"
      >
        Publicar Reporte
      </button>
    </form>
  );
}