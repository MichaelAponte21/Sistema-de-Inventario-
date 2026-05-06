package EntornosProgramacion.SistemaInventario.dto.response;

import java.time.LocalDateTime;

public record MovimientoResponse(
    Long id,
    String tipo,
    Integer cantidad,
    LocalDateTime fecha,
    String observacion,
    Long productoId,
    String productoNombre,
    Long usuarioId,
    String usuarioEmail
) {
}
