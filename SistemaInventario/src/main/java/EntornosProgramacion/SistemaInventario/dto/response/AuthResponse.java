package EntornosProgramacion.SistemaInventario.dto.response;

public record AuthResponse(
    String token,
    String type,
    Long expiresInMs,
    String email,
    String rol
) {
}
