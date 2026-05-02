package EntornosProgramacion.SistemaInventario.dto.response;

import java.time.LocalDateTime;

public record UsuarioResponse(
    String id,
    String nombre,
    String email,
    String rol,
    Boolean activo,
    LocalDateTime fechaCreacion
) {
}
