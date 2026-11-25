
import {
  Injectable,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { DecisionValidacionImagen } from './interfaces/resultado-validacion.interface';

export interface ArchivoImagen {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type EstadoRoboflow =
  | 'eligible_for_publication'
  | 'manual_review_uncertain'
  | 'manual_review_no_pet';

interface ResultadoWorkflow {
  review_status: EstadoRoboflow;
  candidate_count: number;
  confident_count: number;
}

@Injectable()
export class ValidacionImagenesService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Analiza la fotografía mediante el Workflow de Roboflow.
   *
   * Solo publica automáticamente cuando Roboflow devuelve
   * eligible_for_publication y confident_count es mayor que cero.
   *
   * Cualquier resultado dudoso o error queda pendiente.
   */
  async validarImagenReporte(
    archivo: ArchivoImagen,
  ): Promise<DecisionValidacionImagen> {
    const fechaValidacion = new Date();

    try {
      const resultado = await this.analizarConRoboflow(archivo);

      const contieneAnimal = resultado.candidate_count > 0;

      const etiquetasDetectadas = contieneAnimal
        ? ['Mascota detectada por Roboflow']
        : [];

      const puedePublicarse =
        resultado.review_status === 'eligible_for_publication' &&
        resultado.confident_count > 0;

      if (puedePublicarse) {
        return {
          estado: 'APROBADA',
          aprobada: true,
          esInapropiada: false,
          esDudosa: false,
          motivo:
            'Roboflow identificó una mascota con suficiente confianza.',
          errorServicio: false,
          animal: {
            contieneAnimal: true,
            etiquetasDetectadas,
            confianzaMaxima: 0,
          },
          seguridad: {
            esInapropiada: false,
            adulto: 'NO_DISPONIBLE',
            violencia: 'NO_DISPONIBLE',
          },
          fechaValidacion,
        };
      }

      let motivo =
        'La fotografía requiere revisión administrativa.';

      if (
        resultado.review_status === 'manual_review_uncertain'
      ) {
        motivo =
          'Roboflow detectó un posible animal, pero no con suficiente confianza. El reporte requiere revisión administrativa.';
      } else if (
        resultado.review_status === 'manual_review_no_pet'
      ) {
        motivo =
          'Roboflow no identificó una mascota con suficiente confianza. El reporte requiere revisión administrativa.';
      }

      return {
        estado: 'DUDOSA',
        aprobada: false,
        esInapropiada: false,
        esDudosa: true,
        motivo,
        errorServicio: false,
        animal: {
          contieneAnimal,
          etiquetasDetectadas,
          confianzaMaxima: 0,
        },
        seguridad: {
          esInapropiada: false,
          adulto: 'NO_DISPONIBLE',
          violencia: 'NO_DISPONIBLE',
        },
        fechaValidacion,
      };
    } catch (error) {
      console.error(
        'No fue posible validar la fotografía con Roboflow. El reporte quedará pendiente.',
        error instanceof Error ? error.message : 'Error desconocido',
      );

      return {
        estado: 'DUDOSA',
        aprobada: false,
        esInapropiada: false,
        esDudosa: true,
        motivo:
          'El servicio de análisis visual no estuvo disponible. La fotografía requiere revisión administrativa.',
        errorServicio: true,
        animal: {
          contieneAnimal: false,
          etiquetasDetectadas: [],
          confianzaMaxima: 0,
        },
        seguridad: {
          esInapropiada: false,
          adulto: 'NO_DISPONIBLE',
          violencia: 'NO_DISPONIBLE',
        },
        fechaValidacion,
      };
    }
  }

  /**
   * Envía la imagen al Workflow de Roboflow y normaliza su respuesta.
   */
  async analizarConRoboflow(
    archivo: ArchivoImagen,
  ): Promise<ResultadoWorkflow> {
    const apiKey = this.configService.get<string>(
      'ROBOFLOW_API_KEY',
    );

    const workflowUrl = this.configService.get<string>(
      'ROBOFLOW_WORKFLOW_URL',
    );

    if (!apiKey || !workflowUrl) {
      throw new Error(
        'Falta configurar ROBOFLOW_API_KEY o ROBOFLOW_WORKFLOW_URL.',
      );
    }

    if (!archivo?.buffer || archivo.buffer.length === 0) {
      throw new Error(
        'No se recibió el contenido de la fotografía.',
      );
    }

    const respuesta = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: {
            type: 'base64',
            value: archivo.buffer.toString('base64'),
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!respuesta.ok) {
      throw new Error(
        `Roboflow respondió con HTTP ${respuesta.status}.`,
      );
    }

    const datos: unknown = await respuesta.json();

    let salida: unknown = datos;

    // La interfaz de Roboflow muestra una lista de resultados.
    if (Array.isArray(datos)) {
      salida = datos[0];
    } else if (
      typeof datos === 'object' &&
      datos !== null &&
      'outputs' in datos
    ) {
      const outputs = (datos as { outputs?: unknown }).outputs;

      if (Array.isArray(outputs)) {
        salida = outputs[0];
      }
    }

    if (
      typeof salida !== 'object' ||
      salida === null
    ) {
      throw new Error(
        'Roboflow devolvió una respuesta sin resultados válidos.',
      );
    }

    const resultado = salida as Record<string, unknown>;

    const reviewStatus = resultado.review_status;
    const candidateCount = resultado.candidate_count;
    const confidentCount = resultado.confident_count;

    const estadosValidos: EstadoRoboflow[] = [
      'eligible_for_publication',
      'manual_review_uncertain',
      'manual_review_no_pet',
    ];

    if (
      typeof reviewStatus !== 'string' ||
      !estadosValidos.includes(
        reviewStatus as EstadoRoboflow,
      )
    ) {
      throw new Error(
        'Roboflow devolvió un review_status desconocido.',
      );
    }

    if (
      typeof candidateCount !== 'number' ||
      !Number.isInteger(candidateCount) ||
      candidateCount < 0 ||
      typeof confidentCount !== 'number' ||
      !Number.isInteger(confidentCount) ||
      confidentCount < 0 ||
      confidentCount > candidateCount
    ) {
      throw new Error(
        'Roboflow devolvió cantidades de detección inválidas.',
      );
    }

    if (
      reviewStatus === 'eligible_for_publication' &&
      confidentCount === 0
    ) {
      throw new Error(
        'Roboflow indicó publicación sin detecciones confiables.',
      );
    }

    return {
      review_status: reviewStatus as EstadoRoboflow,
      candidate_count: candidateCount,
      confident_count: confidentCount,
    };
  }
}
