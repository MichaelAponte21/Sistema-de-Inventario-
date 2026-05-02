package EntornosProgramacion.SistemaInventario.dto.response;

import java.time.LocalDateTime;

public record MovimientoResponse(
    String id,
    String tipo,
    Integer cantidad,
    LocalDateTime fecha,
    String observacion,
    String productoId,
    String productoNombre,
    String usuarioId,
    String usuarioEmail
) {
}
