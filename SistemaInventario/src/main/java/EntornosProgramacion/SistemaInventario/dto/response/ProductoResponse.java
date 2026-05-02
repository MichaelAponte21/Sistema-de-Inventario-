package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(
    String id,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    Integer stockMinimo,
    String categoriaId,
    String categoriaNombre,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion,
    Boolean stockBajo
) {
}
