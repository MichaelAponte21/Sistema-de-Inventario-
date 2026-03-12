package EntornosProgramacion.SistemaInventario.dto.request;

import EntornosProgramacion.SistemaInventario.model.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    String nombre,

    @Email(message = "El email no tiene un formato valido")
    String email,

    RoleName rol,

    Boolean activo
) {
}
