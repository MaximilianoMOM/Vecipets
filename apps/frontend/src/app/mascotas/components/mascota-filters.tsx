"use client";

type MascotaFiltersProps = {
  search: string;
  tipo: string;
  especie: string;

  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onEspecieChange: (value: string) => void;
};

export default function MascotaFilters({
  search,
  tipo,
  especie,
  onSearchChange,
  onTipoChange,
  onEspecieChange,
}: MascotaFiltersProps) {
  return (
    <div className="mascota-filters">

      <input
        type="text"
        value={search}
        placeholder="Buscar por nombre, sector o raza..."
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
      />

      <select
        value={tipo}
        onChange={(e) =>
          onTipoChange(e.target.value)
        }
      >
        <option value="todos">
          Todos los casos
        </option>

        <option value="perdida">
          Mascotas perdidas
        </option>

        <option value="encontrada">
          Mascotas encontradas
        </option>
      </select>

      <select
        value={especie}
        onChange={(e) =>
          onEspecieChange(e.target.value)
        }
      >
        <option value="todas">
          Todas las especies
        </option>

        <option value="Perro">
          Perros
        </option>

        <option value="Gato">
          Gatos
        </option>

        <option value="Otro">
          Otros
        </option>
      </select>

    </div>
  );
}