package EntornosProgramacion.SistemaInventario.dto.response;

import java.util.List;

public record RolConPermisosResponse(
    Long id,
    String nombre,
    List<PermisoResponse> permisos
) {
    public record PermisoResponse(Long id, String nombre, String descripcion) {}
}
